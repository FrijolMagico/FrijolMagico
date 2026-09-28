import type { CatalogArtist } from '../types/catalog'

export const deduplicateTimelineEditions = (
  editions: CatalogArtist['editions']
): CatalogArtist['editions'] => {
  const seen = new Set<string>()

  return editions.filter((edition) => {
    const key = JSON.stringify([
      edition.evento_id ?? edition.evento,
      edition.edicion,
      edition.año ?? null
    ])

    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}
