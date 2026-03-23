import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { asc } from 'drizzle-orm'
import { artist } from '@frijolmagico/database/schema'

type SelectCall = {
  whereArgs: unknown[]
  orderByArgs: unknown[]
}

const cacheTag = mock(() => {})
const updateTag = mock(() => {})
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
mock.module('next/cache', () => ({ cacheTag, updateTag }))
mock.module('next/cache.js', () => ({ cacheTag, updateTag }))
mock.module('@frijolmagico/database/orm', () => ({ db: dbProxy }))

function flattenPrimitiveValues(value: unknown): Array<string | number> {
  if (Array.isArray(value)) {
    return value.flatMap(flattenPrimitiveValues)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [value]
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  if ('value' in value) {
    return flattenPrimitiveValues((value as { value: unknown }).value)
  }

  if ('queryChunks' in value) {
    return flattenPrimitiveValues(
      (value as { queryChunks: unknown[] }).queryChunks
    )
  }

  if ('table' in value) {
    return []
  }

  return Object.values(value).flatMap(flattenPrimitiveValues)
}

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

const { getActiveAgrupaciones } =
  await import('@/core/artistas/agrupaciones/_lib/get-active-agrupaciones')
const { getDeletedAgrupaciones } =
  await import('@/core/artistas/agrupaciones/_lib/get-deleted-agrupaciones')

describe('agrupaciones query contracts', () => {
  beforeEach(() => {
    cacheTag.mockClear()
  })

  test('getActiveAgrupaciones returns paginated active rows, orders by nombre and tags the cache', async () => {
    const dbMock = createDbMock([
      [
        {
          id: 1,
          nombre: 'Río Arriba',
          descripcion: 'Colectivo andino',
          correo: 'rio@frijolmagico.cl',
          activo: true,
          createdAt: '2026-03-20 12:00:00',
          memberCount: 3
        }
      ],
      [{ total: 1 }]
    ])
    currentDb = dbMock.db

    const result = await getActiveAgrupaciones({
      page: 2,
      limit: 10,
      search: 'Río'
    })

    expect(cacheTag).toHaveBeenCalledWith('agrupacion-active')
    expect(result).toEqual({
      data: [
        {
          id: 1,
          nombre: 'Río Arriba',
          descripcion: 'Colectivo andino',
          correo: 'rio@frijolmagico.cl',
          activo: true,
          createdAt: '2026-03-20 12:00:00',
          memberCount: 3
        }
      ],
      total: 1,
      page: 2,
      pageSize: 10,
      totalPages: 1
    })
    expect(dbMock.calls[0]?.orderByArgs).toEqual([
      asc(artist.collective.nombre)
    ])

    const whereValues = flattenPrimitiveValues(dbMock.calls[0]?.whereArgs ?? [])

    expect(whereValues).toContain('%río%')
  })

  test('getDeletedAgrupaciones keeps deleted rows only and tags the deleted cache', async () => {
    const dbMock = createDbMock([
      [
        {
          id: 2,
          nombre: 'Surco Sur',
          descripcion: null,
          correo: null,
          activo: false,
          createdAt: '2026-03-18 12:00:00',
          deletedAt: '2026-03-19 12:00:00',
          memberCount: 1
        },
        {
          id: 3,
          nombre: 'Fila inconsistente',
          descripcion: null,
          correo: null,
          activo: false,
          createdAt: '2026-03-18 12:00:00',
          deletedAt: null,
          memberCount: 0
        }
      ],
      [{ total: 2 }]
    ])
    currentDb = dbMock.db

    const result = await getDeletedAgrupaciones({
      page: 1,
      limit: 20,
      search: 'Sur'
    })

    expect(cacheTag).toHaveBeenCalledWith('agrupacion-deleted')
    expect(result.data).toEqual([
      {
        id: 2,
        nombre: 'Surco Sur',
        descripcion: null,
        correo: null,
        activo: false,
        createdAt: '2026-03-18 12:00:00',
        deletedAt: '2026-03-19 12:00:00',
        memberCount: 1
      }
    ])
    expect(result.total).toBe(2)
    expect(dbMock.calls[0]?.orderByArgs).toEqual([
      asc(artist.collective.nombre)
    ])

    const whereValues = flattenPrimitiveValues(dbMock.calls[0]?.whereArgs ?? [])

    expect(whereValues).toContain('%sur%')
  })
})
