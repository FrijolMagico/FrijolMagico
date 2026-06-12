import type { CatalogArtist } from '../types/catalog'

/** Busca un artista por slug en el array ya obtenido. O(n), sin llamadas a DB. */
export const getArtistBySlug = (
  data: CatalogArtist[],
  slug: string
): CatalogArtist | null => {
  return data.find((a) => a.slug === slug) ?? null
}
