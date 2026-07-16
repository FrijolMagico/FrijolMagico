import { beforeEach, describe, expect, mock, test } from 'bun:test'

const updateTag = mock(() => {})
const revalidateWebCache = mock(() => Promise.resolve({ revalidated: true }))
const requireAuth = mock(async () => ({ user: { id: '1' } }))

type UpdateState = {
  values: unknown[]
  whereCalls: number
}

function createDbMock() {
  const updateState: UpdateState = { values: [], whereCalls: 0 }

  return {
    updateState,
    db: {
      update: () => ({
        set: (values: unknown) => {
          updateState.values.push(values)
          return {
            where: () => {
              updateState.whereCalls += 1
              return Promise.resolve()
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
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCache }))
mock.module('@frijolmagico/database/orm', () => ({
  db: new Proxy(
    {},
    {
      get: (_, property) => currentDb[property as keyof typeof currentDb]
    }
  )
}))

const { updateEditionPublicationAction } = await import(
  '@/core/eventos/_actions/update-edition-publication.action'
)

describe('updateEditionPublicationAction', () => {
  beforeEach(() => {
    currentDb = createDbMock().db
    updateTag.mockClear()
    revalidateWebCache.mockClear()
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
      if (remoteCalls === 2) return Promise.reject(new Error('remote cache unavailable'))
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
    expect(updateTag).toHaveBeenCalledTimes(2)
    expect(revalidateWebCache).toHaveBeenCalledTimes(2)
    expect(consoleError).toHaveBeenCalled()
  })

  test('returns failure without invalidating caches when the write fails', async () => {
    currentDb = {
      update: () => ({
        set: () => ({
          where: () => Promise.reject(new Error('connection lost'))
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
