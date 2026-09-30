import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { CATALOG_BASE_CACHE_TAG } from '@frijolmagico/cache-tags'

const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCacheBestEffort = mock(async (_options: { tag: string }) => {})
const updateValues: unknown[] = []
let committedAvatar: {
  id: number
  artistaId: number
  path: string
  version: string
}[] = []

const db = {
  select: () => ({
    from: () => ({
      where: () => ({ limit: async () => committedAvatar })
    })
  }),
  transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
    callback({
      select: () => ({
        from: () => ({
          where: () => ({ limit: async () => [{ deletedAt: null }] })
        })
      }),
      update: () => ({
        set: (values: unknown) => ({
          where: () => {
            updateValues.push(values)
            if (
              typeof values === 'object' &&
              values !== null &&
              'activo' in values
            ) {
              return Promise.resolve()
            }
            return { returning: async () => [] }
          }
        })
      }),
      insert: () => ({
        values: () => ({
          returning: async () => [
            {
              id: 10,
              artistaId: 42,
              path: 'artistas/42/avatar-v1.webp',
              version: 'v1'
            }
          ]
        })
      })
    })
}

mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort
}))

const { createArtistAvatarUploadReceipt } =
  await import('@/core/artistas/catalogo/_lib/artist-avatar-upload-receipt')
const { persistArtistAvatarAction } =
  await import('@/core/artistas/_actions/persist-artist-avatar.action')

const secret = 'test-receipt-secret'

function activeCatalogReceipt() {
  process.env.ASSET_RECEIPT_SECRET = secret
  return createArtistAvatarUploadReceipt(
    {
      subjectId: 'admin-1',
      artistaId: 42,
      path: 'artistas/42/avatar-v1.webp',
      version: 'v1',
      expectedActive: undefined,
      catalogId: 3,
      requestedActive: true
    },
    secret
  )
}

describe('persist artist avatar cache invalidation', () => {
  beforeEach(() => {
    updateValues.length = 0
    committedAvatar = []
    revalidateWebCacheBestEffort.mockClear()
    requireAuth.mockReset()
    requireAuth.mockResolvedValue({ user: { id: 'admin-1' } })
  })

  test('invalidates the canonical catalog cache after activating an artist', async () => {
    const result = await persistArtistAvatarAction({
      receipt: activeCatalogReceipt()
    })

    expect(result).toMatchObject({ success: true, data: { id: 10 } })
    expect(updateValues).toContainEqual({ activo: true })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_BASE_CACHE_TAG
    })
  })

  test('re-invalidates the canonical catalog cache for an idempotent retry', async () => {
    committedAvatar = [
      {
        id: 10,
        artistaId: 42,
        path: 'artistas/42/avatar-v1.webp',
        version: 'v1'
      }
    ]

    const result = await persistArtistAvatarAction({
      receipt: activeCatalogReceipt()
    })

    expect(result).toMatchObject({ success: true, data: { id: 10 } })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_BASE_CACHE_TAG
    })
  })
})
