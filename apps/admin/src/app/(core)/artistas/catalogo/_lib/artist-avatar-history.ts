export interface ArtistAvatarHistoryItem {
  id: number
  path: string
  version: string | null
  deletedAt: string | null
}

export interface AvatarHistorySelection {
  intent: 'unchanged' | 'historical'
  avatarId?: number
}

export interface AvatarSequenceItem {
  id: number
  path: string
  version: string | null
  deletedAt?: string | null
}

function timestamp(value: string | null): number {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER
}

export function orderAvatarHistory(
  avatars: ArtistAvatarHistoryItem[]
): ArtistAvatarHistoryItem[] {
  return avatars.toSorted((left, right) => {
    const deletedAtDifference =
      timestamp(right.deletedAt) - timestamp(left.deletedAt)
    return deletedAtDifference || right.id - left.id
  })
}

export function getAvatarHistoryItem(
  avatars: ArtistAvatarHistoryItem[],
  index: number
): ArtistAvatarHistoryItem | null {
  return avatars[index] ?? null
}

export function createAvatarSequence(
  activeAvatar: AvatarSequenceItem | null,
  history: ArtistAvatarHistoryItem[]
): AvatarSequenceItem[] {
  return activeAvatar
    ? [activeAvatar, ...orderAvatarHistory(history)]
    : orderAvatarHistory(history)
}

export function clampAvatarHistoryIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0))
}

export function resolveAvatarIntent(
  activeAvatar: AvatarSequenceItem | null,
  selectedAvatar: AvatarSequenceItem | null
): AvatarHistorySelection {
  if (!selectedAvatar || selectedAvatar.id === activeAvatar?.id)
    return { intent: 'unchanged' }

  return { intent: 'historical', avatarId: selectedAvatar.id }
}
