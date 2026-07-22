import 'server-only'

import { cacheTag } from 'next/cache'
import { and, desc, eq, isNull } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { ARTIST_CACHE_TAG } from '@frijolmagico/cache-tags'

export interface ArtistAvatar {
  id: number
  artistaId: number
  path: string
  version: string | null
}

export async function getArtistAvatar(
  artistaId: number
): Promise<ArtistAvatar | null> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  const [avatar] = await db
    .select({
      id: artist.artistImage.id,
      artistaId: artist.artistImage.artistaId,
      path: artist.artistImage.imagenUrl,
      version: artist.artistImage.artistAvatarVersion
    })
    .from(artist.artistImage)
    .where(
      and(
        eq(artist.artistImage.artistaId, artistaId),
        eq(artist.artistImage.tipo, 'avatar'),
        isNull(artist.artistImage.deletedAt)
      )
    )
    .orderBy(desc(artist.artistImage.createdAt), desc(artist.artistImage.id))
    .limit(1)

  return avatar ?? null
}
