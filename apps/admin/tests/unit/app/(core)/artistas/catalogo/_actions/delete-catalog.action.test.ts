import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { CANONICAL_CATALOG_SLUGS_CACHE_TAG } from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const deleteCatalogEntry = mock(async () => ({ wasFeatured: false, wasActive: true }))

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCache }))
mock.module('@/shared/lib/catalog-artist-deletion', () => ({ deleteCatalogEntry }))
mock.module('@frijolmagico/database/orm', () => ({
  db: { transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({}) }
}))

const { deleteCatalogAction } = await import(
  '@/core/artistas/catalogo/_actions/delete-catalog.action'
)

beforeEach(() => {
  updateTag.mockClear()
  requireAuth.mockClear()
  revalidateWebCache.mockClear()
  deleteCatalogEntry.mockReset()
  deleteCatalogEntry.mockResolvedValue({ wasFeatured: false, wasActive: true })
})

describe('deleteCatalogAction canonical slug invalidation', () => {
  test('invalidates canonical slugs after confirmed catalog deletion while preserving catalog invalidation', async () => {
    await expect(deleteCatalogAction(9)).resolves.toEqual({ success: true })

    expect(deleteCatalogEntry).toHaveBeenCalledTimes(1)
    expect(deleteCatalogEntry).toHaveBeenCalledWith(expect.anything(), 9)
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:base',
      path: '/catalogo'
    })
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:participaciones')
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('does not invalidate canonical slugs after deleting an inactive row while preserving catalog invalidation', async () => {
    deleteCatalogEntry.mockResolvedValue({ wasFeatured: false, wasActive: false })

    await expect(deleteCatalogAction(9)).resolves.toEqual({ success: true })

    expect(deleteCatalogEntry).toHaveBeenCalledWith(expect.anything(), 9)
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:base',
      path: '/catalogo'
    })
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:participaciones')
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas')
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('preserves Featured invalidation for a deleted featured row', async () => {
    deleteCatalogEntry.mockResolvedValue({ wasFeatured: true, wasActive: true })

    await expect(deleteCatalogAction(9)).resolves.toEqual({ success: true })

    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'home:destacados',
      path: '/'
    })
  })
})
