import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { desc } from 'drizzle-orm'

import { artist } from '@frijolmagico/database/schema'

type SelectCall = {
  whereArgs: unknown[]
  orderByArgs: unknown[]
}

const cacheTag = mock(() => {})
let currentDb: ReturnType<typeof createDbMock>['db']

const dbProxy = {
  select: (...args: unknown[]) => {
    void args

    if (!currentDb) {
      throw new Error('currentDb mock was not initialized')
    }

    return currentDb.select()
  }
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag }))
mock.module('next/cache.js', () => ({ cacheTag }))
mock.module('@frijolmagico/database/orm', () => ({ db: dbProxy }))

function createQueryBuilder<T>(result: T, call: SelectCall) {
  const builder = {
    from: () => builder,
    where: (...args: unknown[]) => {
      call.whereArgs.push(...args)
      return builder
    },
    orderBy: (...args: unknown[]) => {
      call.orderByArgs.push(...args)
      return builder
    },
    limit: () => builder,
    offset: () => builder,
    then: (
      resolve: (value: T) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(resolve, reject)
  }

  return builder
}

function createDbMock(results: unknown[]) {
  const calls: SelectCall[] = []

  return {
    calls,
    db: {
      select: () => {
        const result = results.shift()

        if (result === undefined) {
          throw new Error('No mocked result available for db.select')
        }

        const call: SelectCall = {
          whereArgs: [],
          orderByArgs: []
        }

        calls.push(call)

        return createQueryBuilder(result, call)
      }
    }
  }
}

const { getActiveBands } =
  await import('@/core/artistas/bandas/_lib/get-active-bands')
const { getDeletedBands, getDeletedBandCount } =
  await import('@/core/artistas/bandas/_lib/get-deleted-bands')

describe('band DAL', () => {
  beforeEach(() => {
    cacheTag.mockClear()
  })

  test('getActiveBands returns paginated active rows and tags the cache', async () => {
    const dbMock = createDbMock([
      [
        {
          id: 1,
          name: 'Los Andes',
          description: 'Folclor latinoamericano',
          email: 'losandes@frijolmagico.cl',
          phone: '+56912345678',
          city: 'La Serena',
          country: 'Chile',
          active: true,
          createdAt: '2026-03-22 12:00:00'
        }
      ],
      [{ total: 1 }]
    ])
    currentDb = dbMock.db

    const result = await getActiveBands({
      page: 1,
      pageSize: 20,
      mostrar_eliminados: false
    })

    expect(result.total).toBe(1)
    expect(result.data[0]?.name).toBe('Los Andes')
    expect(dbMock.calls).toHaveLength(2)
    expect(dbMock.calls[0]?.whereArgs.length).toBe(1)
  })

  test('getDeletedBands returns deleted rows and count metadata', async () => {
    const dbMock = createDbMock([
      [
        {
          id: 2,
          name: 'Mar de Fondo',
          description: null,
          email: null,
          phone: null,
          city: 'Coquimbo',
          country: 'Chile',
          active: false,
          createdAt: '2026-03-20 12:00:00',
          deletedAt: '2026-03-21 12:00:00'
        }
      ],
      [{ total: 4 }],
      [{ total: 4 }]
    ])
    currentDb = dbMock.db

    const result = await getDeletedBands({
      page: 1,
      pageSize: 20,
      mostrar_eliminados: true
    })
    const count = await getDeletedBandCount()

    expect(result.data[0]?.deletedAt).toBe('2026-03-21 12:00:00')
    expect(result.total).toBe(4)
    expect(count).toBe(4)
    expect(dbMock.calls[0]?.orderByArgs).toEqual([desc(artist.band.deletedAt)])
  })
})
