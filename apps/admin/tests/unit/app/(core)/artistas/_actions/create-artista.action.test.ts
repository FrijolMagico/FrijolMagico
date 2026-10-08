import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { RevalidateWebCacheOptions } from '@/shared/lib/web-invalidation'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const returning = mock(async () => [{ id: 42 }])
const revalidateWebCacheBatch = mock(
  async (requests: RevalidateWebCacheOptions[], _operation: string) =>
    requests.length === 0 ? {} : { webRevalidation: 'swr' as const }
)

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBatch
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    insert: () => ({
      values: () => ({ returning })
    })
  }
}))

const { createArtistaAction } =
  await import('@/core/artistas/_actions/create-artista.action')

const validArtist = {
  pseudonimo: 'Artist test',
  nombre: 'Artist',
  rut: null,
  telefono: null,
  correo: null,
  ciudad: null,
  pais: null,
  estadoId: 1,
  rrss: null,
  slug: 'artist-test'
}

beforeEach(() => {
  updateTag.mockClear()
  requireAuth.mockClear()
  returning.mockReset()
  returning.mockResolvedValue([{ id: 42 }])
  revalidateWebCacheBatch.mockClear()
})

describe('createArtistaAction web cache synchronization', () => {
  test('returns the created ID without adding remote invalidation requests', async () => {
    const result = await createArtistaAction({ success: false }, validArtist)

    expect(result).toEqual({ success: true, data: { id: 42 } })
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith([], 'create-artista')
  })

  test('preserves database errors and skips synchronization when creation fails', async () => {
    returning.mockRejectedValue(new Error('database unavailable'))

    await expect(
      createArtistaAction({ success: false }, validArtist)
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'artista', message: 'database unavailable' }]
    })
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
