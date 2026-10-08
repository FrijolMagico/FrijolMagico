import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const revalidateWebCache = mock(() => Promise.resolve({ revalidated: true }))
const revalidateWebCacheBatch = mock(
  async (requests: { mode?: 'immediate' | 'swr' }[]) => ({
    ...(requests.some(({ mode }) => mode === 'swr')
      ? { webRevalidation: 'swr' as const }
      : requests.length
        ? { webRevalidation: 'immediate' as const }
        : {})
  })
)
const buildWebInvalidationUrl = mock(() => 'https://example.com/api/revalidate')
const revalidateWebCacheBestEffort = mock(async () => {})
const getSession = mock(async () => ({ user: { id: '1' } }))
const requireAuth = mock(async () => ({ user: { id: '1' } }))
const getUser = mock(async () => ({ id: '1' }))

type UpdateState = {
  values: unknown[]
  whereCalls: number
  returningCalls: number
}

function createDbMock(returningRows: unknown[] = [{ id: 1 }]) {
  const updateState: UpdateState = {
    values: [],
    whereCalls: 0,
    returningCalls: 0
  }

  return {
    updateState,
    db: {
      update: () => ({
        set: (values: unknown) => {
          updateState.values.push(values)
          return {
            where: () => {
              updateState.whereCalls += 1
              return {
                returning: () => {
                  updateState.returningCalls += 1
                  return Promise.resolve(returningRows)
                }
              }
            }
          }
        }
      })
    }
  }
}

let currentDb = createDbMock().db

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))
mock.module('@/shared/lib/web-invalidation', () => ({
  buildWebInvalidationUrl,
  revalidateWebCache,
  revalidateWebCacheBatch,
  revalidateWebCacheBestEffort
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: new Proxy(
    {},
    {
      get: (_, property) => currentDb[property as keyof typeof currentDb]
    }
  )
}))

const { updateEditionPublicationAction } =
  await import('@/core/eventos/_actions/update-edition-publication.action')

describe('updateEditionPublicationAction', () => {
  beforeEach(() => {
    currentDb = createDbMock().db
    updateTag.mockClear()
    revalidateWebCache.mockClear()
    revalidateWebCache.mockImplementation(() =>
      Promise.resolve({ revalidated: true })
    )
    revalidateWebCacheBatch.mockImplementation(
      async (requests: { mode?: 'immediate' | 'swr' }[]) => ({
        ...(requests.some(({ mode }) => mode === 'swr')
          ? { webRevalidation: 'swr' as const }
          : requests.length
            ? { webRevalidation: 'immediate' as const }
            : {})
      })
    )
    revalidateWebCacheBatch.mockClear()
    requireAuth.mockClear()
  })

  test('authenticates before validating or writing', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db
    requireAuth.mockImplementationOnce(async () => {
      throw new Error('Unauthorized')
    })

    const result = await updateEditionPublicationAction({
      id: 1,
      published: true
    })

    expect(result.success).toBe(false)
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(dbMock.updateState.values).toHaveLength(0)
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('rejects malformed input without changing persisted publication state', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    const result = await updateEditionPublicationAction({
      id: 0,
      published: true
    })

    expect(result.success).toBe(false)
    expect(dbMock.updateState.values).toHaveLength(0)
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('preserves mutation success while awaiting batched cache synchronization', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db
    let resolveBatch: ((summary: { webRevalidation: 'swr' }) => void) | undefined
    const consoleError = mock(() => {})
    const originalConsoleError = globalThis.console.error
    globalThis.console.error = consoleError
    updateTag
      .mockImplementationOnce(() => {
        throw new Error('local edition cache unavailable')
      })
      .mockImplementationOnce(() => {
        throw new Error('local event cache unavailable')
      })
    revalidateWebCacheBatch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveBatch = resolve
        })
    )

    let completed = false
    const resultPromise = updateEditionPublicationAction({
      id: 7,
      published: true
    }).then((result) => {
      completed = true
      return result
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(completed).toBe(false)
    expect(resolveBatch).toBeDefined()
    resolveBatch?.({ webRevalidation: 'swr' })
    const result = await resultPromise
    globalThis.console.error = originalConsoleError

    expect(result).toEqual({
      success: true,
      data: { published: true },
      webRevalidation: 'swr'
    })
    expect(dbMock.updateState.values).toEqual([{ published: true }])
    expect(dbMock.updateState.whereCalls).toBe(1)
    expect(dbMock.updateState.returningCalls).toBe(1)
    expect(updateTag).toHaveBeenCalledTimes(2)
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'update-edition-publication'
    )
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenNthCalledWith(
      1,
      '[edition-publication] Local cache sync failed',
      { tag: EDITION_CACHE_TAG }
    )
    expect(consoleError).toHaveBeenNthCalledWith(
      2,
      '[edition-publication] Local cache sync failed',
      { tag: EVENT_CACHE_TAG }
    )
  })

  test('keeps success and unconditional cache invalidation when no row is returned', async () => {
    const dbMock = createDbMock([])
    currentDb = dbMock.db

    const result = await updateEditionPublicationAction({
      id: 7,
      published: true
    })

    expect(result).toEqual({
      success: true,
      data: { published: true },
      webRevalidation: 'swr'
    })
    expect(dbMock.updateState.whereCalls).toBe(1)
    expect(dbMock.updateState.returningCalls).toBe(1)
    expect(updateTag).toHaveBeenCalledTimes(2)
    expect(updateTag).toHaveBeenCalledWith(EDITION_CACHE_TAG)
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'update-edition-publication'
    )
    expect(revalidateWebCache).not.toHaveBeenCalled()
  })

  test('omits freshness metadata when the batch has no summary', async () => {
    revalidateWebCacheBatch.mockImplementationOnce(async () => ({}))

    const result = await updateEditionPublicationAction({
      id: 7,
      published: false
    })

    expect(result).toEqual({ success: true, data: { published: false } })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'update-edition-publication'
    )
  })

  test('returns failure without invalidating caches when the write fails', async () => {
    currentDb = {
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.reject(new Error('connection lost'))
          })
        })
      })
    }

    const result = await updateEditionPublicationAction({
      id: 7,
      published: false
    })

    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toBe('connection lost')
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
