import { beforeEach, describe, expect, mock, test } from 'bun:test'

type SelectCall = {
  args: unknown[]
  whereArgs: unknown[]
}

const cacheTag = mock(() => {})
let currentDb: ReturnType<typeof createDbMock>['db']
const dbProxy = {
  select: (...args: unknown[]) => {
    if (!currentDb) {
      throw new Error('currentDb mock was not initialized')
    }

    return currentDb.select(...args)
  }
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag }))
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
    innerJoin: () => builder,
    leftJoin: () => builder,
    where: (...args: unknown[]) => {
      call.whereArgs.push(...args)
      return builder
    },
    orderBy: () => builder,
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
      select: (...args: unknown[]) => {
        const result = results.shift()

        if (result === undefined) {
          throw new Error('No mocked result available for db.select')
        }

        const call: SelectCall = {
          args,
          whereArgs: []
        }

        calls.push(call)

        return createQueryBuilder(result, call)
      }
    }
  }
}

const { getCatalogData, getArtistsNotInCatalog } =
  await import('@/core/artistas/catalogo/_lib/get-catalog-data')

describe('get-catalog-data DAL', () => {
  function getCacheTags(): string[] {
    return cacheTag.mock.calls.map((call) => String(call.at(0)))
  }

  beforeEach(() => {
    cacheTag.mockClear()
  })

  test('getCatalogData dual-tags reads and narrows avatar lookup to page artist ids', async () => {
    const dbMock = createDbMock([
      [
        {
          id: 11,
          artistaId: 7,
          orden: 'a0',
          destacado: true,
          activo: true,
          descripcion: 'Catálogo',
          deletedAt: null,
          artist: {
            id: 7,
            pseudonimo: 'Luna Roja',
            nombre: 'Ana Pérez',
            rut: null,
            telefono: null,
            correo: 'ana@frijolmagico.cl',
            ciudad: 'Santiago',
            pais: 'Chile',
            estadoId: 2,
            rrss: '{"instagram":"@luna"}'
          }
        }
      ],
      [
        {
          artistaId: 7,
          imagenUrl: 'avatars/luna.png',
          orden: 1
        }
      ],
      [{ total: 1 }]
    ])
    currentDb = dbMock.db

    const result = await getCatalogData({
      page: 1,
      pageSize: 20,
      search: '',
      filters: {}
    })

    expect(getCacheTags()).toEqual(['admin:catalog:artists', 'admin:artist'])
    expect(result.data[0]?.artist).toMatchObject({
      id: 7,
      pseudonimo: 'Luna Roja',
      nombre: 'Ana Pérez',
      correo: 'ana@frijolmagico.cl',
      ciudad: 'Santiago',
      pais: 'Chile',
      rrss: { instagram: '@luna' }
    })
    expect(result.data[0]?.avatarUrl).toContain('avatars/luna.png')

    const avatarWhereValues = flattenPrimitiveValues(
      dbMock.calls[1]?.whereArgs ?? []
    )

    expect(avatarWhereValues).toContain('avatar')
    expect(avatarWhereValues).toContain(7)
  })

  test('getCatalogData skips avatar query when the page is empty', async () => {
    const dbMock = createDbMock([[], [{ total: 0 }]])
    currentDb = dbMock.db

    const result = await getCatalogData({
      page: 1,
      pageSize: 20,
      search: '',
      filters: {}
    })

    expect(result.data).toEqual([])
    expect(dbMock.calls).toHaveLength(2)
  })

  test('getArtistsNotInCatalog uses a minimal anti-join query and dual cache tags', async () => {
    const dbMock = createDbMock([
      [
        {
          id: 3,
          pseudonimo: 'Bosque Azul',
          nombre: 'María Soto'
        }
      ],
      []
    ])
    currentDb = dbMock.db

    const result = await getArtistsNotInCatalog()

    expect(result).toEqual([
      {
        id: 3,
        pseudonimo: 'Bosque Azul',
        nombre: 'María Soto'
      }
    ])
    expect(getCacheTags()).toEqual(['admin:catalog:artists', 'admin:artist'])
    expect(
      Object.keys((dbMock.calls[0]?.args[0] ?? {}) as Record<string, unknown>)
    ).toEqual(['id', 'pseudonimo', 'nombre'])
    expect(dbMock.calls).toHaveLength(2)
    expect(
      Object.keys((dbMock.calls[1]?.args[0] ?? {}) as Record<string, unknown>)
    ).toEqual(['id'])
  })
})
