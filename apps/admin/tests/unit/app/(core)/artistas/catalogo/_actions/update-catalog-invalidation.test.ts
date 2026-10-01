import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

import { getAvatarUrl } from '@frijolmagico/utils/cdn'
import { artist as artistTables } from '@frijolmagico/database/schema'
import { CANONICAL_CATALOG_SLUGS_CACHE_TAG } from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const getSession = mock(async () => ({ user: { id: 'admin-1' } }))
const getUser = mock(async () => ({ id: 'admin-1' }))
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => {})
const buildWebInvalidationUrl = mock(() => 'https://example.com/api/revalidate')

let dbTransaction: (
  cb: (tx: unknown) => Promise<unknown>
) => Promise<unknown> = async () => true
let savedCatalogValues: Record<string, unknown> | null = null
let savedSlugValues: Record<string, unknown>[] = []
let savedAliases: Record<string, unknown>[] = []
let initialCatalogActive = false
let currentCatalogExists = true

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))
mock.module('@/shared/lib/web-invalidation', () => ({
  buildWebInvalidationUrl,
  revalidateWebCache,
  revalidateWebCacheBestEffort
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    transaction: (cb: (tx: unknown) => Promise<unknown>) => dbTransaction(cb)
  }
}))

const { updateCatalogAction } =
  await import('@/core/artistas/catalogo/_actions/update-catalog.action')

const validInput = {
  id: 1,
  artistaId: 42,
  pseudonimoId: 43,
  descripcion: 'Descripción actualizada',
  // Inactive on purpose: these tests cover cache invalidation, not the
  // avatar activation rule (activating without an avatar is rejected).
  activo: false,
  destacado: false,
  avatarUrl: null
}

function makeTx() {
  let initialArtistLookup = true
  return {
    select: (_selection: Record<string, unknown>) => ({
      from: (table: unknown) => ({
        where: () => ({
          limit: async () => {
            if (table === artistTables.artistPseudonym) {
              return [{ id: 43, pseudonimo: 'Selected Artist' }] as never[]
            }
            if (table === artistTables.catalogArtist) {
              return currentCatalogExists
                ? ([{ pseudonimoId: 43, activo: initialCatalogActive, deletedAt: null }] as never[])
                : ([] as never[])
            }
            if (table === artistTables.artistImage) {
              return [{ id: 7, path: 'artistas/current.webp', version: 'v7' }] as never[]
            }
            if (table === artistTables.artist && initialArtistLookup) {
              initialArtistLookup = false
              return [{ slug: 'old-slug' }] as never[]
            }
            return [] as never[]
          }
        })
      })
    }),
    delete: () => ({ where: async () => undefined }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => {
        if (table === artistTables.artistSlugAlias) {
          savedAliases.push(values)
          return Promise.resolve()
        }
        return Promise.resolve()
      }
    }),
    update: (table: unknown) => ({
      set: (values: Record<string, unknown>) => ({
        where: () => {
          if (table === artistTables.artist) savedSlugValues.push(values)
          else savedCatalogValues = values
          return Promise.resolve()
        }
      })
    })
  }
}

describe('update-catalog action — best-effort cache invalidation', () => {
  beforeEach(() => {
    updateTag.mockReset()
    requireAuth.mockReset()
    revalidateWebCache.mockReset()
    savedCatalogValues = null
    savedSlugValues = []
    savedAliases = []
    initialCatalogActive = false
    currentCatalogExists = true
    dbTransaction = async (cb) => {
      const result = await cb(makeTx())
      return result
    }
  })

  afterEach(() => {
    updateTag.mockReset()
  })

  test('returns success when cache invalidation throws', async () => {
    updateTag.mockImplementation(() => {
      throw new Error('cache unavailable')
    })

    const result = await updateCatalogAction({ success: false }, validInput)

    expect(result).toEqual({ success: true })
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(updateTag).toHaveBeenCalledTimes(2)
  })

  test('returns success when cache invalidation succeeds', async () => {
    const result = await updateCatalogAction({ success: false }, validInput)

    expect(result).toEqual({ success: true })
    expect(updateTag).toHaveBeenCalledTimes(2)
    expect(updateTag).toHaveBeenNthCalledWith(1, 'catalogo:artistas:base')
    expect(updateTag).toHaveBeenNthCalledWith(2, 'catalogo:artistas')
  })

  test('returns conflict when transaction returns null', async () => {
    dbTransaction = async () => null

    const result = await updateCatalogAction({ success: false }, validInput)

    expect(result).toEqual({
      success: false,
      errors: [{ entityType: 'AVATAR_CONFLICT', message: 'AVATAR_CONFLICT' }]
    })
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('rejects an expected-none save after another session creates an active avatar', async () => {
    let catalogChanged = false
    let selectCount = 0
    dbTransaction = async (callback) => {
      const result = await callback({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: async () => {
                selectCount += 1
                return selectCount === 1
                  ? [{ id: 43 }]
                  : [{ id: 7, path: 'artistas/current.webp', version: 'v7' }]
              }
            })
          })
        }),
        update: () => ({
          set: () => ({
            where: () => {
              catalogChanged = true
              return Promise.resolve()
            }
          })
        })
      })
      return result
    }

    await expect(
      updateCatalogAction(
        { success: false },
        {
          ...validInput,
          expectedActive: null
        }
      )
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'AVATAR_CONFLICT', message: 'AVATAR_CONFLICT' }]
    })
    expect(catalogChanged).toBe(false)
  })
  test('activates the selected historical avatar with the catalog save result', async () => {
    let selectCount = 0
    const committed = { catalog: 'original', activeAvatarId: 7 }
    dbTransaction = async (callback) => {
      const working = { ...committed }
      const tx = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: async () => {
                selectCount += 1
                return selectCount === 1
                  ? [{ id: 43 }]
                  : selectCount === 2
                    ? [{ id: 7, path: 'artistas/current.webp', version: 'v7' }]
                    : selectCount === 3
                      ? [{ id: 8, artistaId: 42, deletedAt: '2026-07-01' }]
                      : [{ pseudonimoId: 43 }]
              }
            })
          })
        }),
        update: () => ({
          set: (value: { descripcion?: string; deletedAt?: unknown }) => ({
            where: async () => {
              if (value.descripcion) working.catalog = value.descripcion
              if (value.deletedAt === null) working.activeAvatarId = 8
            }
          })
        })
      }
      const result = await callback(tx)
      if (result) Object.assign(committed, working)
      return result
    }

    await expect(
      updateCatalogAction(
        { success: false },
        {
          ...validInput,
          // Full public path (server-built contract); the action rebuilds the
          // same full path from the stored raw key before comparing.
          expectedActive: {
            id: 7,
            path: getAvatarUrl('artistas/current.webp'),
            version: 'v7'
          },
          intent: 'historical',
          avatarId: 8
        }
      )
    ).resolves.toEqual({ success: true })
    expect(committed).toEqual({
      catalog: 'Descripción actualizada',
      activeAvatarId: 8
    })
  })

  test('returns a conflict without changing catalog or avatar state when historical activation fails', async () => {
    let selectCount = 0
    const committed = { catalog: 'original', activeAvatarId: 7 }
    dbTransaction = async (callback) => {
      const working = { ...committed }
      const tx = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: async () => {
                selectCount += 1
                return selectCount === 1
                  ? [{ id: 43 }]
                  : selectCount === 2
                    ? [{ id: 7, path: 'artistas/current.webp', version: 'v7' }]
                    : selectCount === 3
                      ? [{ id: 8, artistaId: 42, deletedAt: '2026-07-01' }]
                      : [{ pseudonimoId: 43 }]
              }
            })
          })
        }),
        update: () => ({
          set: (value: { descripcion?: string; deletedAt?: unknown }) => ({
            where: async () => {
              if (value.descripcion) working.catalog = value.descripcion
              if (value.deletedAt === null)
                throw new Error('activation unavailable')
            }
          })
        })
      }
      const result = await callback(tx)
      if (result) Object.assign(committed, working)
      return result
    }

    await expect(
      updateCatalogAction(
        { success: false },
        {
          ...validInput,
          expectedActive: {
            id: 7,
            path: getAvatarUrl('artistas/current.webp'),
            version: 'v7'
          },
          intent: 'historical',
          avatarId: 8
        }
      )
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'AVATAR_CONFLICT', message: 'AVATAR_CONFLICT' }]
    })
    expect(committed).toEqual({ catalog: 'original', activeAvatarId: 7 })
  })

  test('persists a changed inactive contextual pseudonym without invalidating canonical catalog slugs', async () => {
    const result = await updateCatalogAction(
      { success: false },
      { ...validInput, pseudonimoId: 44 }
    )

    expect(result).toEqual({ success: true })
    expect(savedCatalogValues).toMatchObject({ pseudonimoId: 44 })
    expect(savedSlugValues).toEqual([{ slug: 'selected-artist' }])
    expect(savedAliases).toEqual([{ slug: 'old-slug', artistaId: 42 }])
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas',
      path: '/catalogo'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('does not invalidate canonical slugs when no current catalog row exists', async () => {
    currentCatalogExists = false

    await updateCatalogAction(
      { success: false },
      { ...validInput, activo: true }
    )

    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('invalidates canonical slugs when an inactive catalog row becomes active', async () => {
    await updateCatalogAction(
      { success: false },
      { ...validInput, activo: true }
    )

    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:base',
      path: '/catalogo'
    })
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:participaciones')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('invalidates canonical slugs when an active catalog row becomes inactive', async () => {
    initialCatalogActive = true

    await updateCatalogAction({ success: false }, { ...validInput, activo: false })

    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:base',
      path: '/catalogo'
    })
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:participaciones')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('does not invalidate participation when active state is unchanged', async () => {
    await updateCatalogAction({ success: false }, validInput)

    expect(updateTag).not.toHaveBeenCalledWith('catalogo:artistas:participaciones')
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:base',
      path: '/catalogo'
    })
  })
})
