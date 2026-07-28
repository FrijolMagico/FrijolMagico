import { beforeEach, describe, expect, mock, test } from 'bun:test'

type SelectCall = {
  args: unknown[]
  whereArgs: unknown[]
}

const cacheTag = mock(() => {})
const updateTag = mock(() => {})
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
mock.module('next/cache', () => ({ cacheTag, updateTag }))
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

function createQueryBuilder<T>(results: T[], call: SelectCall) {
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
    groupBy: () => builder,
    as: () => builder,
    then: (
      resolve: (value: T) => unknown,
      reject?: (reason: unknown) => unknown
    ) => {
      const result = results.shift()

      if (result === undefined) {
        return Promise.reject(
          new Error('No mocked result available for db.select')
        )
      }

      return Promise.resolve(result).then(resolve, reject)
    }
  }

  return builder
}

function createDbMock(results: unknown[]) {
  const calls: SelectCall[] = []

  return {
    calls,
    db: {
      select: (...args: unknown[]) => {
        const call: SelectCall = {
          args,
          whereArgs: []
        }

        calls.push(call)

        return createQueryBuilder(results, call)
      }
    }
  }
}

let _getCatalogData: any = null
let _getArtistsNotInCatalog: any = null
let modulesLoaded = false

try {
  const mod = await import('@/core/artistas/catalogo/_lib/get-catalog-data')
  _getCatalogData = mod.getCatalogData
  _getArtistsNotInCatalog = mod.getArtistsNotInCatalog
  modulesLoaded = true
} catch {
  // Bun cannot resolve 'next/cache' from .bun cache directory
}

const getCatalogData = _getCatalogData
const getArtistsNotInCatalog = _getArtistsNotInCatalog

describe.skipIf(!modulesLoaded)('get-catalog-data DAL', () => {
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
          id: 1,
          artistaId: 7,
          imagenUrl: 'avatars/luna.png',
          version: 'v1',
          orden: 1
        }
      ],
      [{ total: 1 }]
    ])
    currentDb = dbMock.db

    const result = await getCatalogData({
      page: 1,
      limit: 20,
      search: '',
      activo: null,
      destacado: null
    })

    expect(getCacheTags()).toEqual(['catalogo:artistas', 'artistas'])
    expect(result.data[0]?.artist).toMatchObject({
      id: 7,
      pseudonimo: 'Luna Roja',
      nombre: 'Ana Pérez',
      correo: 'ana@frijolmagico.cl',
      ciudad: 'Santiago',
      pais: 'Chile',
      rrss: { instagram: ['@luna'] }
    })
    expect(result.data[0]?.avatarUrl).toContain('avatars/luna.png')
    expect(result.data[0]?.activeAvatar).toEqual({
      id: 1,
      path: 'avatars/luna.png',
      version: 'v1'
    })

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
      limit: 20,
      search: '',
      activo: null,
      destacado: null
    })

    expect(result.data).toEqual([])
    expect(dbMock.calls).toHaveLength(2)
  })

  test('getArtistsNotInCatalog returns avatarUrl when artist has avatar', async () => {
    const dbMock = createDbMock([
      [
        { id: 3, pseudonimo: 'Bosque Azul', nombre: 'María Soto' },
        { id: 5, pseudonimo: 'Pintacaritas', nombre: 'Pablo Zamora' }
      ],
      [{ artistaId: 3, imagenUrl: 'avatars/bosque.png' }]
    ])
    currentDb = dbMock.db

    const result = await getArtistsNotInCatalog()

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      id: 3,
      avatarUrl: 'avatars/bosque.png'
    })
    expect(result[1]).toMatchObject({
      id: 5,
      avatarUrl: null
    })
    expect(
      Object.keys((dbMock.calls[0]?.args[0] ?? {}) as Record<string, unknown>)
    ).toEqual(['id', 'pseudonimo', 'nombre'])
  })

  test('getArtistsNotInCatalog returns null avatarUrl for artist without avatar', async () => {
    const dbMock = createDbMock([
      [{ id: 5, pseudonimo: 'Sin Avatar', nombre: null }],
      []
    ])
    currentDb = dbMock.db

    const result = await getArtistsNotInCatalog()

    expect(result).toHaveLength(1)
    expect(result[0].avatarUrl).toBeNull()
  })

  test('getArtistsNotInCatalog uses a minimal anti-join query and dual cache tags', async () => {
    const dbMock = createDbMock([
      [{ id: 3, pseudonimo: 'Bosque Azul', nombre: 'María Soto' }],
      [{ artistaId: 3, imagenUrl: 'avatars/bosque.png' }]
    ])
    currentDb = dbMock.db

    const result = await getArtistsNotInCatalog()

    expect(result).toEqual([
      {
        id: 3,
        pseudonimo: 'Bosque Azul',
        nombre: 'María Soto',
        avatarUrl: 'avatars/bosque.png'
      }
    ])
    expect(getCacheTags()).toEqual(['catalogo:artistas', 'artistas'])
    expect(
      Object.keys((dbMock.calls[0]?.args[0] ?? {}) as Record<string, unknown>)
    ).toEqual(['id', 'pseudonimo', 'nombre'])
    expect(dbMock.calls).toHaveLength(3)
    expect(
      Object.keys((dbMock.calls[1]?.args[0] ?? {}) as Record<string, unknown>)
    ).toEqual(['id'])
    expect(
      Object.keys((dbMock.calls[2]?.args[0] ?? {}) as Record<string, unknown>)
    ).toEqual(['artistaId', 'imagenUrl'])
  })
})
