export const AVATAR_INTENT = {
  UNCHANGED: 'unchanged',
  HISTORICAL: 'historical',
  PREPARED_UPLOAD: 'prepared-upload'
} as const

export type AvatarIntent = (typeof AVATAR_INTENT)[keyof typeof AVATAR_INTENT]

export const AVATAR_CONFLICT = 'AVATAR_CONFLICT' as const

export interface ActiveAvatar {
  id: number
  path: string
  version: string | null
}

export interface ExpectedActiveAvatar {
  id: number
  path: string
  version: string | null
}

export interface AvatarSaveInput {
  expectedActive: ExpectedActiveAvatar | null
  intent: AvatarIntent
  avatarId?: number
}

export interface OwnedDeletedAvatar {
  id: number
  artistaId: number
  deletedAt: string | null
}

export function isExpectedActiveAvatar(
  expected: ExpectedActiveAvatar | null,
  current: ActiveAvatar | null
): boolean {
  if (expected === null || current === null) return expected === current

  return (
    expected.id === current.id &&
    expected.path === current.path &&
    expected.version === current.version
  )
}

export function isOwnedDeletedAvatar(
  avatar: OwnedDeletedAvatar,
  artistaId: number
): boolean {
  return avatar.artistaId === artistaId && avatar.deletedAt !== null
}

export function isActiveAvatarConflict(
  expected: ExpectedActiveAvatar | null,
  current: ActiveAvatar | null
): boolean {
  return !isExpectedActiveAvatar(expected, current)
}
