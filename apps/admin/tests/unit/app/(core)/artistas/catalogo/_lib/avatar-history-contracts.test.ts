import { describe, expect, test } from 'bun:test'

import {
  AVATAR_CONFLICT,
  AVATAR_INTENT,
  isActiveAvatarConflict,
  isExpectedActiveAvatar,
  isOwnedDeletedAvatar,
  type ActiveAvatar
} from '@/core/artistas/catalogo/_lib/avatar-history-contracts'

const activeAvatar: ActiveAvatar = {
  id: 7,
  path: 'artistas/luna/avatar-current.webp',
  version: 'current'
}

describe('avatar history persistence contracts', () => {
  test('recognizes an unchanged active-avatar baseline and rejects a stale one', () => {
    expect(
      isExpectedActiveAvatar(activeAvatar, {
        id: 7,
        path: 'artistas/luna/avatar-current.webp',
        version: 'current'
      })
    ).toBe(true)
    expect(
      isExpectedActiveAvatar(activeAvatar, {
        id: 8,
        path: 'artistas/luna/avatar-new.webp',
        version: 'new'
      })
    ).toBe(false)
  })

  test('accepts only a deleted avatar owned by the saved artist as historical intent', () => {
    expect(
      isOwnedDeletedAvatar(
        {
          id: 11,
          artistaId: 4,
          deletedAt: '2026-07-28T00:00:00.000Z'
        },
        4
      )
    ).toBe(true)
    expect(
      isOwnedDeletedAvatar(
        {
          id: 12,
          artistaId: 5,
          deletedAt: null
        },
        4
      )
    ).toBe(false)
  })

  test('exposes stable intent and conflict values for server actions', () => {
    expect(AVATAR_INTENT.UNCHANGED).toBe('unchanged')
    expect(AVATAR_INTENT.HISTORICAL).toBe('historical')
    expect(AVATAR_INTENT.PREPARED_UPLOAD).toBe('prepared-upload')
    expect(AVATAR_CONFLICT).toBe('AVATAR_CONFLICT')
  })

  test('treats changed or missing active avatars as a concurrency conflict', () => {
    expect(isActiveAvatarConflict(activeAvatar, activeAvatar)).toBe(false)
    expect(isActiveAvatarConflict(activeAvatar, null)).toBe(true)
  })
})
