import { CatalogArtistSchema } from '../../schemas/catalogArtistSchema'

import type { CatalogArtist } from '../../types/catalog'
import type { CatalogArtistFromDB } from '../../types/catalogDB'

/**
 * Mapea y valida un artista raw de la DB al formato de la UI.
 * Usa Zod para validación y transformación.
 *
 * @throws Error si los datos no son válidos
 */
export function mapCatalogArtist(raw: unknown): CatalogArtist {
  const result = CatalogArtistSchema.safeParse(raw)

  if (!result.success) {
    const artistId = (raw as CatalogArtistFromDB)?.id ?? 'unknown'
    console.error('Invalid catalog artist data:', result.error.format())
    throw new Error(`Invalid catalog artist data for id: ${artistId}`)
  }

  return result.data
}

/**
 * Mapea un array de artistas raw de la DB al formato de la UI.
 */
export function mapCatalogArtists(rawArtists: unknown[]): CatalogArtist[] {
  return rawArtists.map(mapCatalogArtist)
}
