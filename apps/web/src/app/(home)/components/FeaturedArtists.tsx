import { ArtistCard } from '@/components/ArtistCard'
import { getFeaturedArtists } from '@/data/data-access-layer/featured-artists/getFeaturedArtists'

export async function FeaturedArtists() {
  const featuredArtists = await getFeaturedArtists()

  return featuredArtists.map((artist) => (
    <ArtistCard key={artist.slug} artist={artist} isFeatured />
  ))
}
