import { getArtists } from '../_lib/get-artists-data'
import { ArtistStoreInitialization } from './artist-store-initialization'

export async function ArtistContent() {
  const artist = await getArtists()
  if (!artist) return null

  return <ArtistStoreInitialization initialData={artist} />
}
