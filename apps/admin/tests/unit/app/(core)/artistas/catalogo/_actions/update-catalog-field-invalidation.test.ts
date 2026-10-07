import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { artist as artistTables } from '@frijolmagico/database/schema'
import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const updateTag = mock((_tag: string) => {})
const revalidateWebCacheBatch = mock(
  async (_requests: Array<{
    tag?: string
    path?: string
    pathType?: 'page'
    mode?: 'immediate' | 'swr'
  }>, _context?: string) => ({})
)
let storedActivo = false
let storedDestacado = false
let storedDeletedAt: Date | null = null
let catalogRowExists = true
let avatarExists = true
let updateValues: Record<string, unknown> | null = null

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBatch }))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    select: () => ({
      from: (table: unknown) => ({
        where: () => ({
          limit: async () =>
            table === artistTables.catalogArtist
              ? catalogRowExists
                ? [
                    {
                      artistaId: 42,
                      activo: storedActivo,
                      destacado: storedDestacado,
                      deletedAt: storedDeletedAt
                    }
                  ]
                : []
              : avatarExists
                ? [{ id: 7 }]
                : []
        })
      })
    }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          updateValues = values
        }
      })
    })
  }
}))

const { updateCatalogFieldAction } =
  await import('@/core/artistas/catalogo/_actions/update-catalog-field.action')

describe('updateCatalogFieldAction — web invalidation', () => {
  beforeEach(() => {
    requireAuth.mockClear()
    updateTag.mockClear()
    revalidateWebCacheBatch.mockClear()
    revalidateWebCacheBatch.mockResolvedValue({})
    storedActivo = false
    storedDestacado = false
    storedDeletedAt = null
    catalogRowExists = true
    avatarExists = true
    updateValues = null
  })

  test('batches base and catalog tags and returns requested SWR metadata after success', async () => {
    revalidateWebCacheBatch.mockResolvedValue({ webRevalidation: 'swr' })

    await expect(updateCatalogFieldAction(1, { destacado: true })).resolves.toEqual({
      success: true,
      webRevalidation: 'swr'
    })

    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: CATALOG_BASE_CACHE_TAG },
        { tag: CATALOG_CACHE_TAG }
      ],
      'update-catalog-field'
    )
    expect(updateTag.mock.calls).toEqual([
      [CATALOG_BASE_CACHE_TAG],
      [CATALOG_CACHE_TAG]
    ])
  })

  test('includes participation and immediate canonical/festival requests only for an active change', async () => {
    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toEqual({
      success: true
    })

    expect(updateValues).toEqual({ activo: true })
    expect(updateTag.mock.calls).toEqual([
      [CATALOG_BASE_CACHE_TAG],
      [CATALOG_CACHE_TAG],
      [CATALOG_PARTICIPATION_CACHE_TAG]
    ])
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: CATALOG_BASE_CACHE_TAG },
        { tag: CATALOG_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG },
        { tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG, mode: 'immediate' },
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        },
        { tag: FEATURED_ARTISTS_CACHE_TAG, mode: 'swr' }
      ],
      'update-catalog-field'
    )
  })

  test('does not add active-change requests when activo is unchanged', async () => {
    storedActivo = true

    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toEqual({
      success: true
    })

    expect(updateValues).toEqual({ activo: true })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: CATALOG_BASE_CACHE_TAG },
        { tag: CATALOG_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG }
      ],
      'update-catalog-field'
    )
  })

  test('does not add immediate requests for soft-deleted or missing rows', async () => {
    storedDeletedAt = new Date('2025-01-01T00:00:00.000Z')

    await updateCatalogFieldAction(1, { activo: true })
    expect(updateValues).toEqual({ activo: true })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).toEqual([
      { tag: CATALOG_BASE_CACHE_TAG },
      { tag: CATALOG_CACHE_TAG },
      { tag: CATALOG_PARTICIPATION_CACHE_TAG }
    ])

    revalidateWebCacheBatch.mockClear()
    updateValues = null
    storedDeletedAt = null
    catalogRowExists = false
    await updateCatalogFieldAction(1, { activo: true })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).toEqual([
      { tag: CATALOG_BASE_CACHE_TAG },
      { tag: CATALOG_CACHE_TAG },
      { tag: CATALOG_PARTICIPATION_CACHE_TAG }
    ])
  })

  test('requests featured SWR for an active change unless destacado is also supplied', async () => {
    storedActivo = false
    await updateCatalogFieldAction(1, { activo: true })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).toContainEqual({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })

    revalidateWebCacheBatch.mockClear()
    storedActivo = false
    await updateCatalogFieldAction(1, { activo: true, destacado: true })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).not.toContainEqual({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
  })

  test('invalidates Featured only when destacado changes public state', async () => {
    storedActivo = true
    storedDestacado = false
    await updateCatalogFieldAction(1, { destacado: true })
    expect(updateValues).toEqual({ destacado: true })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).toContainEqual({
      tag: FEATURED_ARTISTS_CACHE_TAG
    })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).not.toContainEqual({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).not.toContainEqual({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })

    revalidateWebCacheBatch.mockClear()
    storedDestacado = true
    await updateCatalogFieldAction(1, { destacado: true })
    expect(updateValues).toEqual({ destacado: true })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).not.toContainEqual({
      tag: FEATURED_ARTISTS_CACHE_TAG
    })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).not.toContainEqual({ path: '/' })

    revalidateWebCacheBatch.mockClear()
    storedDestacado = true
    await updateCatalogFieldAction(1, { destacado: false })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).toContainEqual({
      tag: FEATURED_ARTISTS_CACHE_TAG
    })
  })

  test('does not invalidate Featured when a non-featured inactive artist stays non-featured', async () => {
    storedActivo = false
    storedDestacado = false

    await updateCatalogFieldAction(1, { destacado: false })

    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).not.toContainEqual({
      tag: FEATURED_ARTISTS_CACHE_TAG
    })
    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).not.toContainEqual({ path: '/' })
  })

  test('keeps the database update successful when the batch returns no freshness metadata', async () => {
    revalidateWebCacheBatch.mockResolvedValue({})

    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toEqual({
      success: true
    })
    expect(updateValues).toEqual({ activo: true })
  })

  test('does not invalidate or report success metadata for validation or avatar-guard failures', async () => {
    revalidateWebCacheBatch.mockResolvedValue({ webRevalidation: 'immediate' })
    await expect(
      updateCatalogFieldAction(1, { activo: 'invalid' } as never)
    ).resolves.toMatchObject({ success: false })
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()

    avatarExists = false
    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toMatchObject({
      success: false
    })
    expect(updateValues).toBeNull()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
