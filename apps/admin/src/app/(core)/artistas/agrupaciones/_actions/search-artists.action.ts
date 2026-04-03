'use server'

import 'server-only'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, isNull, like } from 'drizzle-orm'
import type { ArtistOption } from '../_types/collective.types'

const { artist: artistTable } = artist

export async function searchArtistsAction(
  query: string,
  limit = 20
): Promise<ArtistOption[]> {
  const trimmedQuery = query.trim()
  if (trimmedQuery.length === 0) {
    return []
  }

  const results = await db
    .select({
      id: artistTable.id,
      pseudonym: artistTable.pseudonimo,
      city: artistTable.ciudad
    })
    .from(artistTable)
    .where(
      and(
        isNull(artistTable.deletedAt),
        like(artistTable.pseudonimo, `%${trimmedQuery}%`)
      )
    )
    .orderBy(asc(artistTable.pseudonimo))
    .limit(limit)

  return results.map((row) => ({
    id: row.id,
    pseudonym: row.pseudonym,
    city: row.city
  }))
}
