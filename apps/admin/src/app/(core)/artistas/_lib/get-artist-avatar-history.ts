import 'server-only'

import { and, desc, eq } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'

import {
  orderAvatarHistory,
  type ArtistAvatarHistoryItem
} from '../catalogo/_lib/artist-avatar-history'

export async function getArtistAvatarHistory(
  artistaId: number
): Promise<ArtistAvatarHistoryItem[]> {
  const avatars = await db
    .select({
      id: artist.artistImage.id,
      path: artist.artistImage.imagenUrl,
      version: artist.artistImage.artistAvatarVersion,
      deletedAt: artist.artistImage.deletedAt
    })
    .from(artist.artistImage)
    .where(
      and(
        eq(artist.artistImage.artistaId, artistaId),
        eq(artist.artistImage.tipo, 'avatar')
      )
    )
    .orderBy(desc(artist.artistImage.deletedAt), desc(artist.artistImage.id))

  return orderAvatarHistory(avatars)
}
