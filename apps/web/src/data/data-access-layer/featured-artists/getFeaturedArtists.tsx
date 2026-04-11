import { FeaturedArtist } from '@/types/artists'
import { executeQuery } from '@frijolmagico/database/client'
import { loadSql } from '@frijolmagico/database/sql'
import { cacheTag } from 'next/cache'

export const getFeaturedArtists = async () => {
  'use cache'
  cacheTag('home:featured-artists')

  const query = loadSql(import.meta.url, './featured-artists.sql')
  try {
    const { data, error } = await executeQuery<FeaturedArtist>(query, [])

    if (error) {
      console.error('Error fetching featured artists:', error)
      return []
    }

    if (!data || data.length === 0) {
      console.warn('No featured artists found')
      return []
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching featured artists:', error)
  }
}
