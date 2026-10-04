import { cacheLife, cacheTag } from 'next/cache'
import { FEATURED_ARTISTS_CACHE_TAG } from '@frijolmagico/cache-tags'
import { executeQuery } from '@frijolmagico/database/client'

import type { FeaturedArtist } from '@/types/artists'

export const FEATURED_ARTISTS_QUERY = `SELECT
    primary_pseudonym.pseudonimo AS pseudonimo,
    a.slug,
    a.rrss,
    ai.imagen_url
FROM catalogo_artista ac
LEFT JOIN artista a ON ac.artista_id = a.id
LEFT JOIN artista_pseudonimo_principal app ON app.artista_id = a.id
LEFT JOIN artista_pseudonimo primary_pseudonym ON primary_pseudonym.id = app.pseudonimo_id
LEFT JOIN artista_imagen ai ON a.id = ai.artista_id
WHERE a.deleted_at IS null AND ac.destacado = true AND ac.activo = true AND ac.deleted_at IS NULL
LIMIT 3`

export const getFeaturedArtists = async (): Promise<FeaturedArtist[]> => {
  'use cache'

  cacheTag(FEATURED_ARTISTS_CACHE_TAG)
  cacheLife({
    stale: 5 * 60,
    revalidate: Infinity,
    expire: Infinity
  })

  const { data, error } = await executeQuery<FeaturedArtist>(
    FEATURED_ARTISTS_QUERY,
    []
  )

  if (error) {
    throw new Error('Error fetching featured artists', { cause: error })
  }

  if (!data || data.length === 0) {
    throw new Error('No featured artists found')
  }

  return data
}
