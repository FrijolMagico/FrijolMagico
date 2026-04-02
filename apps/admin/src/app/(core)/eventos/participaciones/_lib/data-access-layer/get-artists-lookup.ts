import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { asc, eq } from 'drizzle-orm'

import { ARTIST_CACHE_TAG } from '@/core/artistas/_constants'
import type { ArtistLookup } from '@/core/eventos/participaciones/_types/participations.types'

const { artist: artistTable, artistStatus } = artist

export async function getArtistsLookup(): Promise<Map<number, ArtistLookup>> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  const results = await db
    .select({
      id: artistTable.id,
      pseudonym: artistTable.pseudonimo,
      statusId: artistStatus.id
    })
    .from(artistTable)
    .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
    .where(isNotDeleted(artistTable.deletedAt))
    .orderBy(asc(artistTable.pseudonimo))

  return new Map(
    results.map((row) => [
      row.id,
      {
        id: row.id,
        pseudonym: row.pseudonym,
        statusId: row.statusId ?? 1
      }
    ])
  )
}
