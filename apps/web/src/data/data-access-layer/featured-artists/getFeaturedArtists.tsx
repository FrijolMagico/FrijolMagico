import { FeaturedArtist } from '@/types/artists'
import { executeQuery } from '@frijolmagico/database/client'
import { unstable_cache } from 'next/cache'

const FEATURED_ARTISTS_QUERY = `SELECT
    a.pseudonimo,
    a.slug,
    a.rrss,
    ai.imagen_url
FROM catalogo_artista ac
LEFT JOIN artista a ON ac.artista_id = a.id
LEFT JOIN artista_imagen ai ON a.id = ai.artista_id
WHERE a.deleted_at IS null AND ac.destacado = true AND ac.activo = true
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
    tags: ['home:featured-artists'],
    revalidate: 86400 // backup: expire after 1 day
  }
)

export const getFeaturedArtists = async (): Promise<FeaturedArtist[]> => {
  return getCachedFeaturedArtists()
}
