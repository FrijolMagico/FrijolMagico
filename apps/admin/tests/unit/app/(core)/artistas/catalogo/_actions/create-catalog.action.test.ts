import { beforeEach, describe, expect, mock, test } from 'bun:test'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => {})
const max = mock(() => 'max(orden)')
let insertedValues: Record<string, unknown> | null = null
let returningResult: unknown = [
  { id: 9, artistaId: 42 }
]

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('drizzle-orm', () => ({ max }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort
}))
mock.module('@frijolmagico/database/schema', () => ({
  artist: { catalogArtist: { orden: 'orden' } }
}))
mock.module('@/core/artistas/catalogo/_schemas/catalog.schema', () => ({
  catalogInsertSchema: {
    safeParse: (value: unknown) => ({ success: true, data: value })
  }
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    select: () => ({ from: () => Promise.resolve([{ maxOrden: null }]) }),
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        insertedValues = values
        return { returning: async () => returningResult }
      }
    })
  }
}))

const { createCatalogAction } = await import(
  new URL(
    '../../../../../../../src/app/(core)/artistas/catalogo/_actions/create-catalog.action.ts',
    import.meta.url
  ).href
)

describe('createCatalogAction', () => {
  beforeEach(() => {
    insertedValues = null
    returningResult = [{ id: 9, artistaId: 42 }]
    updateTag.mockClear()
    revalidateWebCacheBestEffort.mockClear()
  })

  test('returns the committed identifiers and keeps the row inactive', async () => {
    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, descripcion: null, destacado: false, activo: true }
    )

    expect(result).toEqual({
      success: true,
      data: { catalogId: 9, artistId: 42, requestedActive: true }
    })
    expect(insertedValues).toMatchObject({ artistaId: 42, activo: false })
  })

  test('invokes internal best-effort revalidation after a committed create', async () => {
    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, descripcion: null, destacado: true, activo: false }
    )

    expect(result).toEqual({
      success: true,
      data: { catalogId: 9, artistId: 42, requestedActive: false }
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
      { artistaId: 42, descripcion: null, destacado: false, activo: false }
    )

    expect(result).toEqual({
      success: true,
      data: { catalogId: 9, artistId: 42, requestedActive: false }
    })
  })

  test('returns an explicit creation failure when the insert confirms no identifiers', async () => {
    returningResult = []

    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, descripcion: null, destacado: false, activo: false }
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

  test('returns an explicit creation failure when the insert returns invalid identifiers', async () => {
    returningResult = [{ id: '9', artistaId: 42 }]

    const result = await createCatalogAction(
      { success: false },
      { artistaId: 42, descripcion: null, destacado: false, activo: false }
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
