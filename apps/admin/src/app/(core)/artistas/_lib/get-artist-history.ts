import { cacheTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { ARTIST_HISTORY_CACHE_TAG } from '../_constants'
import { ArtistHistory } from '../_schemas/history.schema'

export async function getHistoryData(): Promise<ArtistHistory[]> {
  'use cache'
  cacheTag(ARTIST_HISTORY_CACHE_TAG)

  const results = await db
    .select({
      id: artist.artistHistory.id,
      artistaId: artist.artistHistory.artistaId,
      pseudonimo: artist.artistHistory.pseudonimo,
      correo: artist.artistHistory.correo,
      ciudad: artist.artistHistory.ciudad,
      pais: artist.artistHistory.pais,
      rrss: artist.artistHistory.rrss,
      orden: artist.artistHistory.orden
    })
    .from(artist.artistHistory)
    .orderBy(asc(artist.artistHistory.orden))

  if (results === undefined || results.length === 0) return []

  return results.map((row) => ({
    ...row,
    rrss: row.rrss ? JSON.parse(row.rrss) : null
  }))
}
