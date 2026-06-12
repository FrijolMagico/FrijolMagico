import { ArtistCard } from '@/components/ArtistCard'
import { getFeaturedArtists } from '@/data/data-access-layer/featured-artists/getFeaturedArtists'

export async function FeaturedArtists() {
  const featuredArtists = await getFeaturedArtists()

  if (!featuredArtists || featuredArtists.length === 0)
    return (
      <p className='text-foreground/60 mx-auto block w-full max-w-lg pt-10 text-center'>
        No hay artistas destacados en este momento. ¡Vuelve pronto para
        descubrir algunxs de lxs mejores artistas de la Región!
      </p>
    )

  return featuredArtists.map((artist) => (
    <ArtistCard key={artist.slug} artist={artist} isFeatured />
  ))
}
