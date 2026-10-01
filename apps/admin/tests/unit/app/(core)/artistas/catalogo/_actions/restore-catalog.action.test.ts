import { beforeEach, describe, expect, mock, test } from 'bun:test'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCacheBestEffort = mock(async (_options: { tag: string }) => {})
const catalogArtistTable = { id: 'catalog.id', deletedAt: 'catalog.deletedAt' }
let restoredRows: { id: number }[] = [{ id: 9 }]

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBestEffort }))
mock.module('@frijolmagico/database/schema', () => ({
  artist: { catalogArtist: catalogArtistTable }
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    update: () => ({
      set: () => ({
        where: () => ({ returning: async () => restoredRows })
      })
    })
  }
}))
mock.module('drizzle-orm', () => ({
  and: (...conditions: unknown[]) => conditions,
  eq: (...values: unknown[]) => values,
  isNotNull: (value: unknown) => value
}))

const { restoreCatalogAction } = await import(
  '@/core/artistas/catalogo/_actions/restore-catalog.action'
)

beforeEach(() => {
  updateTag.mockClear()
  requireAuth.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  restoredRows = [{ id: 9 }]
})

describe('restoreCatalogAction catalog invalidation', () => {
  test('preserves catalog invalidation only after the restore returns a row', async () => {
    await expect(restoreCatalogAction(9)).resolves.toEqual({ success: true })

    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:base'
    })
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:participaciones')
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas')
  })

  test('does not invalidate caches when no row was restored', async () => {
    restoredRows = []

    await expect(restoreCatalogAction(9)).resolves.toEqual({ success: true })

    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
