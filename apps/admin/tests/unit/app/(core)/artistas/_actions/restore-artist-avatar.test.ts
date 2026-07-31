import { beforeEach, describe, expect, mock, test } from 'bun:test'

const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const updateTag = mock(() => {})
const events: string[] = []
let activeAvatarDeleted = false
let historicalAvatarDeleted = true

let restoredAvatar: {
  id: number
  artistaId: number
  path: string
  version: string | null
} | null = null

const transaction = {
  update: () => ({
    set: (values: { deletedAt: unknown }) => ({
      where: () => {
        if (values.deletedAt === null) {
          events.push('restored')
          if (restoredAvatar) historicalAvatarDeleted = false
        } else {
          events.push('deactivated')
          activeAvatarDeleted = true
        }
        return {
          returning: async () => {
            return restoredAvatar ? [restoredAvatar] : []
          }
        }
      }
    })
  })
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    transaction: async (
      callback: (tx: typeof transaction) => Promise<unknown>
    ) => callback(transaction)
  }
}))

const { restoreArtistAvatarAction } =
  await import('@/core/artistas/_actions/restore-artist-avatar.action')

describe('restore artist avatar', () => {
  beforeEach(() => {
    events.length = 0
    updateTag.mockClear()
    activeAvatarDeleted = false
    historicalAvatarDeleted = true
    restoredAvatar = {
      id: 8,
      artistaId: 12,
      path: 'artistas/legacy/avatar.png',
      version: null
    }
  })

  test('restores a legacy avatar and replaces the prior active row without changing catalog state', async () => {
    const expectedAvatar = {
      id: 8,
      artistaId: 12,
      path: 'artistas/legacy/avatar.png',
      version: null
    }
    await expect(
      restoreArtistAvatarAction({ artistaId: 12, avatarId: 8 })
    ).resolves.toEqual({ success: true, data: expectedAvatar })

    expect(events).toEqual(['restored', 'deactivated'])
    expect(activeAvatarDeleted).toBe(true)
    expect(historicalAvatarDeleted).toBe(false)
    expect(updateTag).toHaveBeenCalledTimes(1)
  })

  test('preserves the active avatar and database state when the selected deleted avatar is missing', async () => {
    restoredAvatar = null

    await expect(
      restoreArtistAvatarAction({ artistaId: 12, avatarId: 8 })
    ).resolves.toEqual({
      success: false,
      errors: [
        {
          entityType: 'artist-avatar',
          message: 'No se encontró un avatar eliminado para restaurar'
        }
      ]
    })

    expect(updateTag).not.toHaveBeenCalled()
    expect(events).toEqual(['restored'])
    expect(activeAvatarDeleted).toBe(false)
    expect(historicalAvatarDeleted).toBe(true)
  })

  test('propagates the unauthenticated redirect sentinel', async () => {
    const redirectSentinel = { digest: 'NEXT_REDIRECT;replace;/login;307;' }
    requireAuth.mockRejectedValueOnce(redirectSentinel)

    await expect(
      restoreArtistAvatarAction({ artistaId: 12, avatarId: 8 })
    ).rejects.toBe(redirectSentinel)

    expect(events).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
  })
})
