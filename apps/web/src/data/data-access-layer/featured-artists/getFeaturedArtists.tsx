import { FEATURED_ARTISTS_CACHE_TAG } from '@frijolmagico/cache-tags'
import { FeaturedArtist } from '@/types/artists'
import { executeQuery } from '@frijolmagico/database/client'
import { unstable_cache } from 'next/cache'

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

const getCachedFeaturedArtists = unstable_cache(
  async () => {
    const { data, error } = await executeQuery<FeaturedArtist>(
      FEATURED_ARTISTS_QUERY,
      []
    )

    if (error) {
      console.error('Error fetching featured artists:', error)
      return [] as FeaturedArtist[]
    }

    if (!data || data.length === 0) {
      console.warn('No featured artists found')
      return [] as FeaturedArtist[]
    }

    return data
  },
  ['featured-artists'],
  {
    tags: [FEATURED_ARTISTS_CACHE_TAG],
    revalidate: false
  }
)

export const getFeaturedArtists = async (): Promise<FeaturedArtist[]> => {
  return getCachedFeaturedArtists()
}
