import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

import { getAvatarUrl } from '@frijolmagico/utils/cdn'

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

const CURRENT_AVATAR = { id: 7, path: 'artistas/current.webp', version: 'v7' }

function createTx(rows: unknown[], onUpdate?: () => void) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => rows
        })
      })
    }),
    update: () => ({
      set: () => ({
        where: () => {
          onUpdate?.()
          return Promise.resolve()
        }
      })
    })
  }
}

const baseInput = {
  id: 1,
  artistaId: 42,
  descripcion: 'Descripción actualizada',
  destacado: false,
  avatarUrl: null
}

describe('update-catalog action — avatar optimistic concurrency', () => {
  beforeEach(() => {
    updateTag.mockReset()
    requireAuth.mockReset()
    revalidateWebCache.mockReset()
    dbTransaction = async (cb) => {
      const result = await cb(createTx([]))
      return result
    }
  })

  afterEach(() => {
    updateTag.mockReset()
  })

  test('accepts a save when expectedActive matches the full public path', async () => {
    let catalogChanged = false
    dbTransaction = async (cb) => {
      const result = await cb(
        createTx([CURRENT_AVATAR], () => {
          catalogChanged = true
        })
      )
      return result
    }

    const result = await updateCatalogAction(
      { success: false },
      {
        ...baseInput,
        activo: false,
        expectedActive: {
          id: 7,
          path: getAvatarUrl(CURRENT_AVATAR.path),
          version: 'v7'
        },
        intent: 'unchanged'
      }
    )

    expect(result).toEqual({ success: true })
    expect(catalogChanged).toBe(true)
  })

  test('rejects a save when expectedActive carries a raw path instead of the full public path', async () => {
    let catalogChanged = false
    dbTransaction = async (cb) => {
      const result = await cb(
        createTx([CURRENT_AVATAR], () => {
          catalogChanged = true
        })
      )
      return result
    }

    // Regression: the client snapshot must carry the full public path (built
    // server-side by getCatalogData). A raw `imagenUrl` is a stale/foreign
    // representation and must be treated as a conflict, never as a match.
    const result = await updateCatalogAction(
      { success: false },
      {
        ...baseInput,
        activo: false,
        expectedActive: CURRENT_AVATAR,
        intent: 'unchanged'
      }
    )

    expect(result).toEqual({
      success: false,
      errors: [{ entityType: 'AVATAR_CONFLICT', message: 'AVATAR_CONFLICT' }]
    })
    expect(catalogChanged).toBe(false)
  })

  test('rejects activating a catalog entry without an active avatar', async () => {
    let catalogChanged = false
    dbTransaction = async (cb) => {
      const result = await cb(
        createTx([], () => {
          catalogChanged = true
        })
      )
      return result
    }

    const result = await updateCatalogAction(
      { success: false },
      {
        ...baseInput,
        activo: true,
        expectedActive: null,
        intent: 'unchanged'
      }
    )

    expect(result).toEqual({
      success: false,
      errors: [
        {
          entityType: 'catalogo',
          message:
            'No se puede activar una entrada sin avatar. Debe subir un avatar antes de activar la entrada.'
        }
      ]
    })
    expect(catalogChanged).toBe(false)
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('allows saving an avatar-less entry without activating it', async () => {
    let catalogChanged = false
    dbTransaction = async (cb) => {
      const result = await cb(
        createTx([], () => {
          catalogChanged = true
        })
      )
      return result
    }

    const result = await updateCatalogAction(
      { success: false },
      {
        ...baseInput,
        activo: false,
        expectedActive: null,
        intent: 'unchanged'
      }
    )

    expect(result).toEqual({ success: true })
    expect(catalogChanged).toBe(true)
  })
})
