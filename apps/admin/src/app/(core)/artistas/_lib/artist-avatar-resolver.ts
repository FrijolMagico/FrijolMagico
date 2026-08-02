import 'server-only'

import { eq } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireEligibleArtist } from './artist-avatar-lifecycle'

export async function resolveArtistAvatar(artistId: number): Promise<{
  artistId: number
  canonicalSlug: string
}> {
  const [candidate] = await db
    .select({
      id: artist.artist.id,
      slug: artist.artist.slug,
      artistDeletedAt: artist.artist.deletedAt,
      catalogDeletedAt: artist.catalogArtist.deletedAt
    })
    .from(artist.artist)
    .innerJoin(
      artist.catalogArtist,
      eq(artist.catalogArtist.artistaId, artist.artist.id)
    )
    .where(eq(artist.artist.id, artistId))
    .limit(1)

  return requireEligibleArtist(candidate ?? null)
}
