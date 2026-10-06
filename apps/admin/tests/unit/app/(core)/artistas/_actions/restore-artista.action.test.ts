import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { RevalidateWebCacheOptions } from '@/shared/lib/web-invalidation'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const where = mock(async () => undefined)
const revalidateWebCacheBatch = mock(
  async (requests: RevalidateWebCacheOptions[], _operation: string) =>
    requests.length === 0 ? {} : { webRevalidation: 'immediate' as const }
)

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBatch
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    update: () => ({
      set: () => ({ where })
    })
  }
}))

const { restoreArtistaAction } =
  await import('@/core/artistas/_actions/restore-artista.action')

beforeEach(() => {
  updateTag.mockClear()
  requireAuth.mockClear()
  where.mockReset()
  where.mockResolvedValue(undefined)
  revalidateWebCacheBatch.mockClear()
})

describe('restoreArtistaAction web cache synchronization', () => {
  test('restores the artist and makes one empty batch without adding metadata', async () => {
    await expect(restoreArtistaAction(42)).resolves.toEqual({ success: true })
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith([], 'restore-artista')
  })

  test('preserves database errors and skips synchronization when restore fails', async () => {
    where.mockRejectedValue(new Error('database unavailable'))

    await expect(restoreArtistaAction(42)).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'artista', message: 'database unavailable' }]
    })
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
