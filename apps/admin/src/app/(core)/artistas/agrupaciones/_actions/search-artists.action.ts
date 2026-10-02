'use server'

import 'server-only'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, eq, exists, inArray, isNull, like, or } from 'drizzle-orm'
import type { ArtistOption } from '../_types/collective.types'

const {
  artist: artistTable,
  artistPseudonym,
  artistPrimaryPseudonym
} = artist

export async function searchArtistsAction(
  query: string,
  limit = 20
): Promise<ArtistOption[]> {
  const trimmedQuery = query.trim()
  if (trimmedQuery.length === 0) {
    return []
  }

  const queryPattern = `%${trimmedQuery}%`
  const results = await db
    .select({
      id: artistTable.id,
      pseudonym: artistPseudonym.pseudonimo,
      legacyPseudonym: artistTable.pseudonimo,
      city: artistTable.ciudad
    })
    .from(artistTable)
    .leftJoin(
      artistPrimaryPseudonym,
      eq(artistPrimaryPseudonym.artistaId, artistTable.id)
    )
    .leftJoin(
      artistPseudonym,
      and(
        eq(artistPseudonym.id, artistPrimaryPseudonym.pseudonimoId),
        isNull(artistPseudonym.deletedAt)
      )
    )
    .where(
      and(
        isNull(artistTable.deletedAt),
        or(
          like(artistTable.nombre, queryPattern),
          exists(
            db
              .select({ id: artistPseudonym.id })
              .from(artistPseudonym)
              .where(
                and(
                  eq(artistPseudonym.artistaId, artistTable.id),
                  isNull(artistPseudonym.deletedAt),
                  like(artistPseudonym.pseudonimo, queryPattern)
                )
              )
          )
        )
      )
    )
    .orderBy(asc(artistPseudonym.pseudonimo), asc(artistTable.pseudonimo))
    .limit(limit)

  if (results.length === 0) {
    return []
  }

  const matchedAliases = await db
    .select({
      artistId: artistPseudonym.artistaId,
      pseudonym: artistPseudonym.pseudonimo
    })
    .from(artistPseudonym)
    .where(
      and(
        inArray(
          artistPseudonym.artistaId,
          results.map((row) => row.id)
        ),
        isNull(artistPseudonym.deletedAt),
        like(artistPseudonym.pseudonimo, queryPattern)
      )
    )

  const matchedAliasesByArtist = new Map<number, Set<string>>()
  for (const match of matchedAliases) {
    const aliases = matchedAliasesByArtist.get(match.artistId) ?? new Set()
    aliases.add(match.pseudonym)
    matchedAliasesByArtist.set(match.artistId, aliases)
  }

  return results.map((row) => ({
    id: row.id,
    pseudonym: row.pseudonym ?? row.legacyPseudonym,
    aliasLabel:
      [...(matchedAliasesByArtist.get(row.id) ?? [])].join(', ') || null,
    city: row.city
  }))
}
