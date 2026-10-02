import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { artist as artistTables } from '@frijolmagico/database/schema'
import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG
} from '@frijolmagico/cache-tags'

const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const updateTag = mock((_tag: string) => {})
const revalidateWebCache = mock(
  async (_options: {
    tag?: string
    path?: string
    pathType?: 'page'
    mode?: 'immediate' | 'swr'
  }) => ({
    revalidated: true
  })
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
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCache }))
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

describe('updateCatalogFieldAction — canonical slug invalidation', () => {
  beforeEach(() => {
    requireAuth.mockClear()
    updateTag.mockClear()
    revalidateWebCache.mockClear()
    storedActivo = false
    storedDestacado = false
    storedDeletedAt = null
    catalogRowExists = true
    avatarExists = true
    updateValues = null
  })

  test('does not invalidate canonical slugs when activo is unchanged', async () => {
    storedActivo = true

    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toEqual({
      success: true
    })

    expect(updateValues).toEqual({ activo: true })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })

  test('invalidates canonical slugs once when activo changes successfully', async () => {
    storedActivo = false

    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toEqual({
      success: true
    })

    expect(updateValues).toEqual({ activo: true })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
    expect(
      revalidateWebCache.mock.calls.filter(
        ([input]) =>
          input.tag === CANONICAL_CATALOG_SLUGS_CACHE_TAG &&
          input.mode === 'immediate'
      )
    ).toHaveLength(1)
  })

  test('does not invalidate canonical slugs when activating a soft-deleted row', async () => {
    storedActivo = false
    storedDeletedAt = new Date('2025-01-01T00:00:00.000Z')

    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toEqual({
      success: true
    })

    expect(updateValues).toEqual({ activo: true })
    expect(updateTag.mock.calls).toContainEqual(['catalogo:artistas:base'])
    expect(updateTag.mock.calls).toContainEqual(['catalogo:artistas'])
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas:base' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })

  test('does not invalidate festival details when the catalog row is missing', async () => {
    catalogRowExists = false

    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toEqual({
      success: true
    })

    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })

  test('does not invalidate festival details when validation fails', async () => {
    await expect(
      updateCatalogFieldAction(1, { activo: 'invalid' } as never)
    ).resolves.toMatchObject({ success: false })

    expect(updateValues).toBeNull()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })

  test('does not invalidate festival details when the avatar guard fails', async () => {
    avatarExists = false

    await expect(updateCatalogFieldAction(1, { activo: true })).resolves.toMatchObject({
      success: false
    })

    expect(updateValues).toBeNull()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
  })

  test('preserves root-path Featured invalidation when destacado changes', async () => {
    storedActivo = true
    storedDestacado = false

    await expect(
      updateCatalogFieldAction(1, { destacado: true })
    ).resolves.toEqual({ success: true })

    expect(updateValues).toEqual({ destacado: true })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      path: '/'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('preserves root-path invalidation without Featured tag when destacado is unchanged', async () => {
    storedActivo = true
    storedDestacado = true

    await expect(
      updateCatalogFieldAction(1, { destacado: true })
    ).resolves.toEqual({ success: true })

    expect(updateValues).toEqual({ destacado: true })
    expect(revalidateWebCache).toHaveBeenCalledWith({ path: '/' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      path: '/'
    })
  })
})
