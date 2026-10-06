import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { resolveWebRevalidationMode } from '@frijolmagico/cache-tags'
import type { RevalidateWebCacheOptions } from '@/shared/lib/web-invalidation'
import {
  ARTIST_CACHE_TAG,
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG
} from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCache = mock(
  async (_request?: RevalidateWebCacheOptions) => ({ revalidated: true })
)
const revalidateWebCacheBatch = mock(
  async (requests: RevalidateWebCacheOptions[], _operation?: string) => {
    await Promise.all(requests.map((request) => revalidateWebCache(request)))
    return requests.some(
      (request) =>
        request.tag &&
        resolveWebRevalidationMode(request.tag, request.mode) === 'swr'
    )
      ? { webRevalidation: 'swr' as const }
      : requests.length > 0
        ? { webRevalidation: 'immediate' as const }
        : {}
  }
)
const deleteCatalogEntry = mock(async () => ({ wasFeatured: false }))

let catalogEntries: {
  id: number
  activo?: boolean
  deletedAt?: Date | null
}[] = []

const transaction = {
  update: () => ({
    set: () => ({ where: async () => undefined })
  })
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBatch
}))
mock.module('@/shared/lib/catalog-artist-deletion', () => ({
  deleteCatalogEntry
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    select: () => ({
      from: () => ({ where: async () => catalogEntries })
    }),
    transaction: async (
      callback: (tx: typeof transaction) => Promise<unknown>
    ) => callback(transaction)
  }
}))

const { deleteArtistaAction } =
  await import('@/core/artistas/_actions/delete-artista.action')

beforeEach(() => {
  catalogEntries = []
  updateTag.mockClear()
  requireAuth.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBatch.mockClear()
  deleteCatalogEntry.mockReset()
  deleteCatalogEntry.mockResolvedValue({ wasFeatured: false })
})

describe('deleteArtistaAction canonical slug invalidation', () => {
  test('invalidates canonical slugs immediately after deleting catalog rows and preserves Featured invalidation', async () => {
    catalogEntries = [{ id: 9, activo: true, deletedAt: null }]
    deleteCatalogEntry.mockResolvedValue({ wasFeatured: true })

    const result = await deleteArtistaAction(1)

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(deleteCatalogEntry).toHaveBeenCalledTimes(1)
    expect(deleteCatalogEntry).toHaveBeenCalledWith(transaction, 9)
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG, mode: 'immediate' },
        { tag: CATALOG_BASE_CACHE_TAG },
        { tag: CATALOG_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG },
        { tag: FEATURED_ARTISTS_CACHE_TAG, path: '/' }
      ],
      'delete-artista'
    )
    expect(updateTag).toHaveBeenCalledWith(ARTIST_CACHE_TAG)
    expect(updateTag).toHaveBeenCalledWith(CATALOG_BASE_CACHE_TAG)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: CATALOG_BASE_CACHE_TAG })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: CATALOG_CACHE_TAG })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: CATALOG_PARTICIPATION_CACHE_TAG })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      path: '/'
    })
  })

  test('does not invalidate canonical slugs when deleting an inactive catalog row', async () => {
    catalogEntries = [{ id: 9, activo: false }]

    await expect(deleteArtistaAction(1)).resolves.toEqual({
      success: true,
      webRevalidation: 'swr'
    })

    expect(deleteCatalogEntry).toHaveBeenCalledWith(transaction, 9)
    expect(updateTag).toHaveBeenCalledWith(CATALOG_BASE_CACHE_TAG)
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: CATALOG_BASE_CACHE_TAG })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: CATALOG_CACHE_TAG })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: CATALOG_PARTICIPATION_CACHE_TAG })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('does not invalidate canonical slugs when there are no active catalog rows', async () => {
    await expect(deleteArtistaAction(1)).resolves.toEqual({
      success: true,
      webRevalidation: 'swr'
    })

    expect(deleteCatalogEntry).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: CATALOG_CACHE_TAG })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: CATALOG_PARTICIPATION_CACHE_TAG })
  })
})
