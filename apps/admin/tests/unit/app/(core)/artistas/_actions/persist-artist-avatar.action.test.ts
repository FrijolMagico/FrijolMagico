import { beforeEach, describe, expect, mock, test } from 'bun:test'

import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCacheBestEffort = mock(async (_options: { tag: string }) => {})
const invalidationBatches: { requests: { tag?: string; mode?: string; path?: string; pathType?: string }[]; context?: string }[] = []
const revalidateWebCacheBatch = mock(async (
  requests: { tag?: string; mode?: string; path?: string; pathType?: string }[],
  context?: string
) => {
  invalidationBatches.push({ requests, context })
  return { webRevalidation: 'swr' as const }
})
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
  revalidateWebCacheBatch,
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

const featuredRequest = { tag: FEATURED_ARTISTS_CACHE_TAG, mode: 'swr' }
const festivalRequest = {
  tag: FESTIVAL_CRITICAL_CACHE_TAG,
  mode: 'immediate',
  path: '/festivales/[slug]',
  pathType: 'page'
}

function expectBatchRequests(requests: typeof invalidationBatches[number]['requests']) {
  expect(invalidationBatches).toEqual([
    { requests, context: 'persist-artist-avatar' }
  ])
}

describe('persist artist avatar cache invalidation', () => {
  beforeEach(() => {
    updateValues.length = 0
    catalogActive = false
    surfaceTransactionErrorAfterCommit = false
    committedAvatar = []
    revalidateWebCacheBestEffort.mockClear()
    revalidateWebCacheBatch.mockClear()
    invalidationBatches.length = 0
    requireAuth.mockReset()
    requireAuth.mockResolvedValue({ user: { id: 'admin-1' } })
  })

  test('batches exact invalidations and returns freshness outside the avatar DTO', async () => {
    const result = await persistArtistAvatarAction({
      receipt: activeCatalogReceipt()
    })

    expect(result).toMatchObject({
      success: true,
      data: { id: 10 },
      webRevalidation: 'swr'
    })
    expect(result.data).not.toHaveProperty('webRevalidation')
    expect(invalidationBatches).toEqual([
      {
        requests: [
          { tag: CATALOG_BASE_CACHE_TAG },
          { tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG, mode: 'immediate' },
          { tag: FEATURED_ARTISTS_CACHE_TAG, mode: 'swr' },
          {
            tag: FESTIVAL_CRITICAL_CACHE_TAG,
            mode: 'immediate',
            path: '/festivales/[slug]',
            pathType: 'page'
          }
        ],
        context: 'persist-artist-avatar'
      }
    ])
    expect(updateValues).toContainEqual({ activo: true })
  })

  test('recovers committed activation after an ambiguous transaction error', async () => {
    surfaceTransactionErrorAfterCommit = true

    const result = await persistArtistAvatarAction({
      receipt: activeCatalogReceipt()
    })

    expect(result).toMatchObject({
      success: true,
      data: { id: 10 },
      webRevalidation: 'swr'
    })
    expectBatchRequests([
      { tag: CATALOG_BASE_CACHE_TAG },
      { tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG, mode: 'immediate' },
      featuredRequest,
      festivalRequest
    ])
  })

  test('does not invalidate canonical slugs when the catalog was already active', async () => {
    catalogActive = true

    const result = await persistArtistAvatarAction({
      receipt: activeCatalogReceipt()
    })

    expect(result).toMatchObject({ success: true, data: { id: 10 } })
    expect(updateValues).toContainEqual({ activo: true })
    expectBatchRequests([
      { tag: CATALOG_BASE_CACHE_TAG },
      featuredRequest,
      festivalRequest
    ])
  })

  test('invalidates Featured but not canonical slugs for an avatar-only receipt', async () => {
    const result = await persistArtistAvatarAction({
      receipt: avatarOnlyReceipt()
    })

    expect(result).toMatchObject({ success: true, data: { id: 10 } })
    expectBatchRequests([featuredRequest, festivalRequest])
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
    expectBatchRequests([
      { tag: CATALOG_BASE_CACHE_TAG },
      { tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG, mode: 'immediate' },
      featuredRequest,
      festivalRequest
    ])
  })

  test('does not invalidate festival detail when the receipt is invalid', async () => {
    const result = await persistArtistAvatarAction({ receipt: 'invalid' })

    expect(result).toMatchObject({ success: false })
    expect(invalidationBatches).toHaveLength(0)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
