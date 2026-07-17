const STORAGE_VERSION = 1

interface FestivalSpoilerStorageRecord {
  version: typeof STORAGE_VERSION
  revealedCategoryIds: string[]
}

interface FestivalSpoilerStorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function getFestivalSpoilerStorageKey(slug: string) {
  return `frijolmagico:festival-spoilers:v1:${slug}`
}

function isStorageRecord(
  value: unknown
): value is FestivalSpoilerStorageRecord {
  if (typeof value !== 'object' || value === null) return false

  const record = value as Record<string, unknown>
  return (
    record.version === STORAGE_VERSION &&
    Array.isArray(record.revealedCategoryIds) &&
    record.revealedCategoryIds.every(
      (categoryId) => typeof categoryId === 'string'
    )
  )
}

export function readFestivalSpoilerStorage(
  storage: FestivalSpoilerStorageAdapter,
  slug: string
) {
  try {
    const raw = storage.getItem(getFestivalSpoilerStorageKey(slug))
    if (!raw) return []

    const record: unknown = JSON.parse(raw)
    return isStorageRecord(record) ? record.revealedCategoryIds : []
  } catch {
    return []
  }
}

export function writeFestivalSpoilerStorage(
  storage: FestivalSpoilerStorageAdapter,
  slug: string,
  revealedCategoryIds: string[]
) {
  try {
    const record: FestivalSpoilerStorageRecord = {
      version: STORAGE_VERSION,
      revealedCategoryIds
    }
    storage.setItem(getFestivalSpoilerStorageKey(slug), JSON.stringify(record))
  } catch {
    // Browser privacy settings or quota errors must not affect readable content.
  }
}
