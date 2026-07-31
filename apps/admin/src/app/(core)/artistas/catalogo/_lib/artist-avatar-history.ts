export interface ArtistAvatarHistoryItem {
  id: number
  path: string
  version: string | null
  deletedAt: string | null
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
