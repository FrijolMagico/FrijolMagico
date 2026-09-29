import { executeQuery } from '@frijolmagico/database/client'

import type { CatalogArtist } from '../types/catalog'

/** Busca un artista por slug en el array ya obtenido. O(n), sin llamadas a DB. */
export const getArtistBySlug = (
  data: CatalogArtist[],
  slug: string
): CatalogArtist | null => {
  return data.find((a) => a.slug === slug) ?? null
}

export const CATALOG_ALIAS_QUERY = `
  SELECT a.slug
  FROM artista_slug_alias alias
  JOIN artista a ON a.id = alias.artista_id
  JOIN catalogo_artista ca ON ca.artista_id = a.id
  WHERE alias.slug = ?
    AND ca.activo = 1
    AND ca.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM artista canonical_artist
      JOIN catalogo_artista canonical_ca ON canonical_ca.artista_id = canonical_artist.id
      WHERE canonical_artist.slug = alias.slug
        AND canonical_ca.activo = 1
        AND canonical_ca.deleted_at IS NULL
    )
  LIMIT 1
`

/** Returns the current canonical slug only when the artist still has an active catalog listing. */
export async function getActiveCatalogSlugForAlias(
  slug: string
): Promise<string | null> {
  const { data, error } = await executeQuery<{ slug: string }>(
    CATALOG_ALIAS_QUERY,
    [slug]
  )

  if (error) {
    console.error('Failed to resolve catalog slug alias:', error.message)
    return null
  }

  return data[0]?.slug ?? null
}

export type CatalogSlugResolution =
  | { artist: CatalogArtist; isAlias: false }
  | { artist: CatalogArtist; isAlias: true }
  | { artist: null; isAlias: false }

/** Canonical slugs take precedence over aliases; aliases resolve to the current catalog artist. */
export function resolveCatalogArtistSlug(
  data: CatalogArtist[],
  slug: string,
  aliasCanonicalSlug: string | null
): CatalogSlugResolution {
  const canonicalArtist = getArtistBySlug(data, slug)
  if (canonicalArtist) return { artist: canonicalArtist, isAlias: false }

  if (!aliasCanonicalSlug) return { artist: null, isAlias: false }

  const aliasArtist = getArtistBySlug(data, aliasCanonicalSlug)
  return aliasArtist
    ? { artist: aliasArtist, isAlias: true }
    : { artist: null, isAlias: false }
}
