import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { and, asc, eq, isNull } from 'drizzle-orm'

import { ARTIST_CACHE_TAG } from '@frijolmagico/cache-tags'
import type { ArtistLookup } from '@/core/eventos/participaciones/_types/participations.types'

const {
  artist: artistTable,
  artistStatus,
  artistPseudonym,
  artistPrimaryPseudonym
} = artist

export async function getArtistsLookup(): Promise<Map<number, ArtistLookup>> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  const rows = await db
    .select({
      id: artistTable.id,
      pseudonym: artistTable.pseudonimo,
      statusId: artistStatus.id,
      pseudonymId: artistPseudonym.id,
      pseudonymName: artistPseudonym.pseudonimo,
      primaryId: artistPrimaryPseudonym.pseudonimoId
    })
    .from(artistTable)
    .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
    .leftJoin(
      artistPseudonym,
      and(
        eq(artistPseudonym.artistaId, artistTable.id),
        isNull(artistPseudonym.deletedAt)
      )
    )
    .leftJoin(
      artistPrimaryPseudonym,
      eq(artistPrimaryPseudonym.artistaId, artistTable.id)
    )
    .where(isNotDeleted(artistTable.deletedAt))
    .orderBy(asc(artistTable.pseudonimo), asc(artistPseudonym.id))

  const lookup = new Map<number, ArtistLookup>()
  for (const row of rows) {
    const entry = lookup.get(row.id) ?? {
      id: row.id,
      pseudonym: row.pseudonym,
      statusId: row.statusId ?? 1,
      pseudonyms: []
    }
    if (row.pseudonymId !== null && row.pseudonymName !== null) {
      const isPrimary = row.pseudonymId === row.primaryId
      entry.pseudonyms.push({
        id: row.pseudonymId,
        pseudonym: row.pseudonymName,
        isPrimary
      })
      if (isPrimary) entry.pseudonym = row.pseudonymName
    }
    lookup.set(row.id, entry)
  }

  return lookup
}
