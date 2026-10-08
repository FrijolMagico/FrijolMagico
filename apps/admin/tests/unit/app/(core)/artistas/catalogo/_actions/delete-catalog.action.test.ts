import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
} from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCacheBatch = mock(async () => ({}))
const deleteCatalogEntry = mock(async () => ({ wasFeatured: false, wasActive: true }))

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBatch }))
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
  revalidateWebCacheBatch.mockClear()
  revalidateWebCacheBatch.mockResolvedValue({})
  deleteCatalogEntry.mockReset()
  deleteCatalogEntry.mockResolvedValue({ wasFeatured: false, wasActive: true })
})

describe('deleteCatalogAction web invalidation', () => {
  test('batches exactly the active slug, festival detail, and three catalog requests', async () => {
    revalidateWebCacheBatch.mockResolvedValue({ webRevalidation: 'immediate' })

    await expect(deleteCatalogAction(9)).resolves.toEqual({
      success: true,
      webRevalidation: 'immediate',
    })

    expect(deleteCatalogEntry).toHaveBeenCalledWith(expect.anything(), 9)
    expect(updateTag).toHaveBeenCalledTimes(3)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG, mode: 'immediate' },
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        },
        { tag: CATALOG_BASE_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG },
        { tag: CATALOG_CACHE_TAG }
      ],
      'delete-catalog'
    )
  })

  test('keeps inactive deletion to the three catalog requests and no freshness metadata', async () => {
    deleteCatalogEntry.mockResolvedValue({ wasFeatured: false, wasActive: false })

    await expect(deleteCatalogAction(9)).resolves.toEqual({ success: true })


    expect(revalidateWebCacheBatch).toHaveBeenCalledWith([
      { tag: CATALOG_BASE_CACHE_TAG },
      { tag: CATALOG_PARTICIPATION_CACHE_TAG },
      { tag: CATALOG_CACHE_TAG },
    ], 'delete-catalog')
    expect(updateTag).toHaveBeenCalledTimes(3)
  })

  test('adds only the existing featured tag when the deleted row was featured', async () => {
    deleteCatalogEntry.mockResolvedValue({ wasFeatured: true, wasActive: false })

    await expect(deleteCatalogAction(9)).resolves.toEqual({ success: true })

    expect(revalidateWebCacheBatch).toHaveBeenCalledWith([
      { tag: CATALOG_BASE_CACHE_TAG },
      { tag: CATALOG_PARTICIPATION_CACHE_TAG },
      { tag: CATALOG_CACHE_TAG },
      { tag: FEATURED_ARTISTS_CACHE_TAG },
    ], 'delete-catalog')

  })

  test('does not invalidate caches when deletion fails', async () => {
    deleteCatalogEntry.mockRejectedValue(new Error('Deletion failed'))

    await expect(deleteCatalogAction(9)).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'catalogo', message: 'Deletion failed' }],
    })

    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
