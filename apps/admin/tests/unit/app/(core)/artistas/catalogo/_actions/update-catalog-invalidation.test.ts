import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

import { getAvatarUrl } from '@frijolmagico/utils/cdn'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCache = mock(async () => ({ revalidated: true }))

let dbTransaction: (
  cb: (tx: unknown) => Promise<unknown>
) => Promise<unknown> = async () => true

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCache }))
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
  descripcion: 'Descripción actualizada',
  // Inactive on purpose: these tests cover cache invalidation, not the
  // avatar activation rule (activating without an avatar is rejected).
  activo: false,
  destacado: false,
  avatarUrl: null
}

function makeTx() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [] as never[]
        })
      })
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve()
      })
    })
  }
}

describe('update-catalog action — best-effort cache invalidation', () => {
  beforeEach(() => {
    updateTag.mockReset()
    requireAuth.mockReset()
    revalidateWebCache.mockReset()
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
    expect(updateTag).toHaveBeenCalledTimes(1)
  })

  test('returns success when cache invalidation succeeds', async () => {
    const result = await updateCatalogAction({ success: false }, validInput)

    expect(result).toEqual({ success: true })
    expect(updateTag).toHaveBeenCalledTimes(1)
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
    dbTransaction = async (callback) => {
      const result = await callback({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: async () => [
                { id: 7, path: 'artistas/current.webp', version: 'v7' }
              ]
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
      updateCatalogAction({ success: false }, {
        ...validInput,
        expectedActive: null
      })
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
                  ? [{ id: 7, path: 'artistas/current.webp', version: 'v7' }]
                  : [{ id: 8, artistaId: 42, deletedAt: '2026-07-01' }]
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
      updateCatalogAction({ success: false }, {
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
      })
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
                  ? [{ id: 7, path: 'artistas/current.webp', version: 'v7' }]
                  : [{ id: 8, artistaId: 42, deletedAt: '2026-07-01' }]
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
      updateCatalogAction({ success: false }, {
        ...validInput,
        expectedActive: {
          id: 7,
          path: getAvatarUrl('artistas/current.webp'),
          version: 'v7'
        },
        intent: 'historical',
        avatarId: 8
      })
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'AVATAR_CONFLICT', message: 'AVATAR_CONFLICT' }]
    })
    expect(committed).toEqual({ catalog: 'original', activeAvatarId: 7 })
  })

  test('triggers web revalidation after successful update', async () => {
    await updateCatalogAction({ success: false }, validInput)

    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas',
      path: '/catalogo'
    })
  })
})
