import { beforeEach, describe, expect, mock, test } from 'bun:test'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCacheBatch = mock(async () => ({}))
const catalogArtistTable = { id: 'catalog.id', deletedAt: 'catalog.deletedAt' }
let restoredRows: { id: number }[] = [{ id: 9 }]
let updateFailure: Error | null = null

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBatch }))
mock.module('@frijolmagico/database/schema', () => ({
  artist: { catalogArtist: catalogArtistTable }
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    update: () => ({
      set: () => ({
        where: () => ({
          returning: async () => {
            if (updateFailure) throw updateFailure
            return restoredRows
          }
        })
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
  revalidateWebCacheBatch.mockClear()
  revalidateWebCacheBatch.mockResolvedValue({})
  restoredRows = [{ id: 9 }]
  updateFailure = null
})

describe('restoreCatalogAction catalog invalidation', () => {
  test('awaits the three existing catalog requests only after the restore returns a row', async () => {
    revalidateWebCacheBatch.mockResolvedValue({ webRevalidation: 'swr' })

    await expect(restoreCatalogAction(9)).resolves.toEqual({
      success: true,
      webRevalidation: 'swr',
    })

    expect(updateTag).toHaveBeenCalledTimes(3)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith([
      { tag: 'catalogo:artistas:base' },
      { tag: 'catalogo:artistas:participaciones' },
      { tag: 'catalogo:artistas' },
    ], 'restore-catalog')
  })

  test('preserves successful no-row outcome without invalidation or freshness metadata', async () => {
    restoredRows = []

    await expect(restoreCatalogAction(9)).resolves.toEqual({ success: true })

    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('preserves the database failure outcome and skips cache effects', async () => {
    updateFailure = new Error('Restore failed')

    await expect(restoreCatalogAction(9)).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'catalogo', message: 'Restore failed' }],
    })

    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
