import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { artist as artistTables } from '@frijolmagico/database/schema'
import { CANONICAL_CATALOG_SLUGS_CACHE_TAG } from '@frijolmagico/cache-tags'

const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const updateTag = mock(() => {})
const revalidateWebCache = mock(async () => ({ revalidated: true }))
let storedActivo = false
let storedDeletedAt: Date | null = null
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
              ? [{ artistaId: 42, activo: storedActivo, deletedAt: storedDeletedAt }]
              : [{ id: 7 }]
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
    storedDeletedAt = null
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
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:base',
      path: '/catalogo'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('does not invalidate canonical slugs for unrelated fields', async () => {
    await expect(
      updateCatalogFieldAction(1, { destacado: true })
    ).resolves.toEqual({ success: true })

    expect(updateValues).toEqual({ destacado: true })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })
})
