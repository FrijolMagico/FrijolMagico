import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const revalidateWebCache = mock(() => Promise.resolve({ revalidated: true }))
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

  test('preserves mutation success while awaiting failed cache synchronization', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db
    const resolvers: (() => void)[] = []
    let remoteCalls = 0
    const consoleError = mock(() => {})
    globalThis.console.error = consoleError
    updateTag.mockImplementationOnce(() => {
      throw new Error('local cache unavailable')
    })
    revalidateWebCache.mockImplementation(() => {
      remoteCalls += 1
      if (remoteCalls === 2)
        return Promise.reject(new Error('remote cache unavailable'))
      return new Promise<{ revalidated: boolean }>((resolve) =>
        resolvers.push(() => resolve({ revalidated: true }))
      )
    })

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
    resolvers.forEach((resolve) => resolve())
    const result = await resultPromise

    expect(result).toEqual({ success: true, data: { published: true } })
    expect(dbMock.updateState.values).toEqual([{ published: true }])
    expect(dbMock.updateState.whereCalls).toBe(1)
    expect(dbMock.updateState.returningCalls).toBe(1)
    expect(updateTag).toHaveBeenCalledTimes(2)
    expect(revalidateWebCache).toHaveBeenCalledTimes(4)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr',
      path: '/festivales',
      pathType: 'page'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      mode: 'immediate',
      path: '/',
      pathType: 'page'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      mode: 'immediate',
      path: '/',
      pathType: 'layout'
    })
    expect(consoleError).toHaveBeenCalled()
  })

  test('keeps success and unconditional cache invalidation when no row is returned', async () => {
    const dbMock = createDbMock([])
    currentDb = dbMock.db

    const result = await updateEditionPublicationAction({
      id: 7,
      published: true
    })

    expect(result).toEqual({ success: true, data: { published: true } })
    expect(dbMock.updateState.whereCalls).toBe(1)
    expect(dbMock.updateState.returningCalls).toBe(1)
    expect(updateTag).toHaveBeenCalledTimes(2)
    expect(updateTag).toHaveBeenCalledWith(EDITION_CACHE_TAG)
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
    expect(revalidateWebCache).toHaveBeenCalledTimes(2)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
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
  })
})
