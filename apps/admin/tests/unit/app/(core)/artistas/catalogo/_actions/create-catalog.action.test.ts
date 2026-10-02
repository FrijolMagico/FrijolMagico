import { beforeEach, describe, expect, mock, test } from 'bun:test'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const getSession = mock(async () => ({ user: { id: 'admin-1' } }))
const getUser = mock(async () => ({ id: 'admin-1' }))
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => {})
const buildWebInvalidationUrl = mock(() => 'https://example.com/api/revalidate')
const max = mock(() => 'max(orden)')
const pseudonymTable = {
  id: 'pseudonym.id',
  artistaId: 'pseudonym.artistaId',
  pseudonimo: 'pseudonym.pseudonimo',
  deletedAt: 'pseudonym.deletedAt'
}
const artistTable = { id: 'artist.id', slug: 'artist.slug' }
const aliasTable = { slug: 'alias.slug', artistaId: 'alias.artistaId' }
const catalogTable = { id: 'catalog.id', orden: 'orden', artistaId: 'catalog.artistId' }
let insertedValues: Record<string, unknown> | null = null
let slugValues: Record<string, unknown>[] = []
let aliasValues: Record<string, unknown>[] = []
let returningResult: unknown = [{ id: 9, artistaId: 42 }]
let ownedPseudonym: unknown = { id: 43 }

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('drizzle-orm', () => ({
  max,
  and: (...conditions: unknown[]) => conditions,
  ne: (...values: unknown[]) => values,
  eq: (...values: unknown[]) => values,
  isNull: (value: unknown) => value
}))
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
mock.module('@frijolmagico/database/schema', () => ({
  artist: {
    artist: artistTable,
    artistSlugAlias: aliasTable,
    catalogArtist: catalogTable,
    artistPseudonym: pseudonymTable
  }
}))
mock.module('@/core/artistas/catalogo/_schemas/catalog.schema', () => ({
  catalogInsertSchema: {
    safeParse: (value: unknown) => ({ success: true, data: value })
  }
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    select: () => ({
      from: (table: unknown) =>
        table === pseudonymTable
          ? { where: () => ({ limit: async () => ownedPseudonym ? [ownedPseudonym] : [] }) }
          : Promise.resolve([{ maxOrden: null }])
    }),
    transaction: async (run: (tx: ReturnType<typeof createTransaction>) => Promise<unknown>) =>
      run(createTransaction()),
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        insertedValues = values
        return { returning: async () => returningResult }
      }
    })
  }
}))

function createTransaction() {
  let initialArtistLookup = true
  return {
    select: () => ({
      from: (table: unknown) => ({
        where: () => ({
          limit: async () => {
            if (table === pseudonymTable) return ownedPseudonym ? [ownedPseudonym] : []
            if (table === artistTable && initialArtistLookup) {
              initialArtistLookup = false
              return [{ slug: 'old-slug' }]
            }
            if (table === artistTable) return []
            if (table === aliasTable) return []
            return []
          }
        })
      })
    }),
    delete: () => ({ where: async () => undefined }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          slugValues.push(values)
        }
      })
    }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => {
        if (table === aliasTable) {
          aliasValues.push(values)
          return Promise.resolve()
        }
        insertedValues = values
        return {
          returning: async () => returningResult
        }
      }
    })
  }
}

const { createCatalogAction } = await import(
  new URL(
    '../../../../../../../src/app/(core)/artistas/catalogo/_actions/create-catalog.action.ts',
    import.meta.url
  ).href
)

describe('createCatalogAction', () => {
  beforeEach(() => {
    insertedValues = null
    slugValues = []
    aliasValues = []
    returningResult = [{ id: 9, artistaId: 42 }]
    ownedPseudonym = { id: 43, pseudonimo: 'Selected Artist' }
    updateTag.mockClear()
    revalidateWebCacheBestEffort.mockClear()
  })

  test('returns the committed identifiers and keeps the row inactive', async () => {
    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, pseudonimoId: 43, descripcion: null, destacado: false, activo: true }
    )

    expect(result).toEqual({
      success: true,
      data: { catalogId: 9, artistId: 42, requestedActive: true }
    })
    expect(insertedValues).toMatchObject({ artistaId: 42, pseudonimoId: 43, activo: false })
    expect(slugValues).toEqual([{ slug: 'selected-artist' }])
    expect(aliasValues).toEqual([{ slug: 'old-slug', artistaId: 42 }])
  })

  test('invokes internal best-effort revalidation after a committed create', async () => {
    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, pseudonimoId: 43, descripcion: null, destacado: true, activo: false }
    )

    expect(result).toEqual({
      success: true,
      data: { catalogId: 9, artistId: 42, requestedActive: false }
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:base',
      path: '/catalogo'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones',
      path: '/catalogo'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas',
      path: '/catalogo'
    })
  })

  test('keeps a committed creation successful when internal cache invalidation fails', async () => {
    updateTag.mockImplementationOnce(() => {
      throw new Error('cache unavailable')
    })

    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, pseudonimoId: 43, descripcion: null, destacado: false, activo: false }
    )

    expect(result).toEqual({
      success: true,
      data: { catalogId: 9, artistId: 42, requestedActive: false }
    })
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:participaciones')
  })

  test('rejects a pseudonym that is inactive or owned by another artist', async () => {
    ownedPseudonym = null

    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, pseudonimoId: 43, descripcion: null, destacado: false, activo: false }
    )

    expect(result).toMatchObject({ success: false })
    expect(insertedValues).toBeNull()
  })

  test('returns an explicit creation failure when the insert confirms no identifiers', async () => {
    returningResult = []

    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, pseudonimoId: 43, descripcion: null, destacado: false, activo: false }
    )

    expect(result).toEqual({
      success: false,
      errors: [
        {
          entityType: 'catalogo',
          message: 'No se pudo confirmar la creación del catálogo'
        }
      ]
    })
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('returns an explicit creation failure when the insert returns invalid identifiers', async () => {
    returningResult = [{ id: '9', artistaId: 42 }]

    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, pseudonimoId: 43, descripcion: null, destacado: false, activo: false }
    )

    expect(result).toEqual({
      success: false,
      errors: [
        {
          entityType: 'catalogo',
          message: 'No se pudo confirmar la creación del catálogo'
        }
      ]
    })
  })
})
