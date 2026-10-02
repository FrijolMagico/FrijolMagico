import { beforeEach, describe, expect, mock, test } from 'bun:test'

import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCacheBestEffort = mock(async (_options: { tag: string }) => {})
const updateValues: unknown[] = []
let catalogActive = false
let surfaceTransactionErrorAfterCommit = false
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
  transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
    const result = await callback({
      select: () => ({
        from: () => ({
          where: () => ({ limit: async () => [{ deletedAt: null }] })
        })
      }),
      update: () => ({
        set: (values: unknown) => ({
          where: () => {
            updateValues.push(values)
            return {
              returning: async () => {
                if (
                  typeof values === 'object' &&
                  values !== null &&
                  'activo' in values
                ) {
                  if (catalogActive) return []
                  catalogActive = true
                  return [{ id: 3 }]
                }
                return []
              }
            }
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
    if (surfaceTransactionErrorAfterCommit) {
      committedAvatar = [
        {
          id: 10,
          artistaId: 42,
          path: 'artistas/42/avatar-v1.webp',
          version: 'v1'
        }
      ]
      throw new Error('transaction outcome is ambiguous')
    }
    return result
  }
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

function avatarOnlyReceipt() {
  process.env.ASSET_RECEIPT_SECRET = secret
  return createArtistAvatarUploadReceipt(
    {
      subjectId: 'admin-1',
      artistaId: 42,
      path: 'artistas/42/avatar-v1.webp',
      version: 'v1',
      expectedActive: undefined,
      catalogId: undefined,
      requestedActive: false
    },
    secret
  )
}

describe('persist artist avatar cache invalidation', () => {
  beforeEach(() => {
    updateValues.length = 0
    catalogActive = false
    surfaceTransactionErrorAfterCommit = false
    committedAvatar = []
    revalidateWebCacheBestEffort.mockClear()
    requireAuth.mockReset()
    requireAuth.mockResolvedValue({ user: { id: 'admin-1' } })
  })

  test('invalidates canonical slugs when persistence activates an inactive catalog', async () => {
    const result = await persistArtistAvatarAction({
      receipt: activeCatalogReceipt()
    })

    expect(result).toMatchObject({ success: true, data: { id: 10 } })
    expect(updateValues).toContainEqual({ activo: true })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_BASE_CACHE_TAG
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })

  test('recovers committed activation after an ambiguous transaction error', async () => {
    surfaceTransactionErrorAfterCommit = true

    const result = await persistArtistAvatarAction({
      receipt: activeCatalogReceipt()
    })

    expect(result).toMatchObject({ success: true, data: { id: 10 } })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })

  test('does not invalidate canonical slugs when the catalog was already active', async () => {
    catalogActive = true

    const result = await persistArtistAvatarAction({
      receipt: activeCatalogReceipt()
    })

    expect(result).toMatchObject({ success: true, data: { id: 10 } })
    expect(updateValues).toContainEqual({ activo: true })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('invalidates Featured but not canonical slugs for an avatar-only receipt', async () => {
    const result = await persistArtistAvatarAction({
      receipt: avatarOnlyReceipt()
    })

    expect(result).toMatchObject({ success: true, data: { id: 10 } })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
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
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })

  test('does not invalidate festival detail when the receipt is invalid', async () => {
    const result = await persistArtistAvatarAction({ receipt: 'invalid' })

    expect(result).toMatchObject({ success: false })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })
})
