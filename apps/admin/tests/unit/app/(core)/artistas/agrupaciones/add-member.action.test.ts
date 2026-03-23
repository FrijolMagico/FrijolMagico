import { beforeEach, describe, expect, mock, test } from 'bun:test'

const cacheTag = mock(() => {})
const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: '1' } }))

type DbMockOptions = {
  existingRows?: Array<{
    agrupacionId: number
    artistaId: number
  }>
  transactionError?: Error
}

type DbMockState = {
  transactionCalls: number
  selectWhereArgs: unknown[][]
  updateSetArgs: unknown[]
  updateWhereArgs: unknown[][]
  insertValuesArgs: unknown[]
}

function createDbMock(options: DbMockOptions = {}) {
  const state: DbMockState = {
    transactionCalls: 0,
    selectWhereArgs: [],
    updateSetArgs: [],
    updateWhereArgs: [],
    insertValuesArgs: []
  }

  const tx = {
    select: () => ({
      from: () => ({
        where: (...args: unknown[]) => {
          state.selectWhereArgs.push(args)
          return Promise.resolve(options.existingRows ?? [])
        }
      })
    }),
    update: () => ({
      set: (...args: unknown[]) => {
        state.updateSetArgs.push(...args)

        return {
          where: (...whereArgs: unknown[]) => {
            state.updateWhereArgs.push(whereArgs)
            return Promise.resolve()
          }
        }
      }
    }),
    insert: () => ({
      values: (...args: unknown[]) => {
        state.insertValuesArgs.push(...args)
        return Promise.resolve()
      }
    })
  }

  return {
    state,
    db: {
      transaction: async (
        callback: (transaction: typeof tx) => Promise<void>
      ) => {
        state.transactionCalls += 1

        if (options.transactionError) {
          throw options.transactionError
        }

        await callback(tx)
      }
    }
  }
}

let currentDb: ReturnType<typeof createDbMock>['db'] = createDbMock().db

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag, updateTag }))
mock.module('next/cache.js', () => ({ cacheTag, updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@frijolmagico/database/orm', () => ({
  db: new Proxy(
    {},
    {
      get: (_, prop) => currentDb[prop as keyof typeof currentDb]
    }
  )
}))

const { addMemberAction } =
  await import('@/core/artistas/agrupaciones/_actions/add-member.action')

describe('addMemberAction', () => {
  beforeEach(() => {
    updateTag.mockClear()
    requireAuth.mockClear()
    currentDb = createDbMock().db
  })

  test('rejects invalid payloads before running the transaction', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    const result = await addMemberAction(
      { success: false },
      {
        agrupacionId: 7,
        artistaId: Number.NaN,
        rol: null,
        activo: true
      }
    )

    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toMatchObject({
      entityType: 'agrupacion_artista'
    })
    expect(dbMock.state.transactionCalls).toBe(0)
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('inserts a new member and invalidates agrupacion caches', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    const result = await addMemberAction(
      { success: false },
      {
        agrupacionId: 7,
        artistaId: 11,
        rol: 'Percusión',
        activo: true
      }
    )

    expect(result).toEqual({ success: true })
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(dbMock.state.transactionCalls).toBe(1)
    expect(dbMock.state.insertValuesArgs).toEqual([
      {
        agrupacionId: 7,
        artistaId: 11,
        rol: 'Percusión',
        activo: true
      }
    ])
    expect(dbMock.state.updateSetArgs).toEqual([])
    const tagCalls = (updateTag.mock.calls as unknown as Array<[string]>).map(
      (call) => call[0]
    )
    expect(tagCalls).toEqual([
      'agrupacion',
      'agrupacion-active',
      'admin:agrupacion:members:7'
    ])
  })

  test('reactivates an existing member instead of inserting a duplicate row', async () => {
    const dbMock = createDbMock({
      existingRows: [{ agrupacionId: 7, artistaId: 11 }]
    })
    currentDb = dbMock.db

    const result = await addMemberAction(
      { success: false },
      {
        agrupacionId: 7,
        artistaId: 11,
        rol: 'Dirección musical',
        activo: false
      }
    )

    expect(result).toEqual({ success: true })
    expect(dbMock.state.insertValuesArgs).toEqual([])
    expect(dbMock.state.updateSetArgs).toEqual([
      {
        activo: true,
        rol: 'Dirección musical'
      }
    ])
    expect(dbMock.state.updateWhereArgs).toHaveLength(1)
  })

  test('returns an action error when the transaction fails', async () => {
    const dbMock = createDbMock({
      transactionError: new Error('db down')
    })
    currentDb = dbMock.db

    const result = await addMemberAction(
      { success: false },
      {
        agrupacionId: 7,
        artistaId: 11,
        rol: null,
        activo: true
      }
    )

    expect(result.success).toBe(false)
    expect(result.errors).toEqual([
      {
        entityType: 'agrupacion_artista',
        message: 'db down'
      }
    ])
    expect(updateTag).not.toHaveBeenCalled()
  })
})
