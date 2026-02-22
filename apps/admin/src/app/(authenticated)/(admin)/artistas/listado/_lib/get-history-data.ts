'use server'

import { cacheTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import type { HistoryEntry } from '../_types'
import { ARTISTA_HISTORIAL_CACHE_TAG } from '../../_constants'

export async function getHistoryData(): Promise<HistoryEntry[]> {
  'use cache'
  cacheTag(ARTISTA_HISTORIAL_CACHE_TAG)

  const results = await db
    .select()
    .from(artist.artistaHistorial)
    .orderBy(asc(artist.artistaHistorial.createdAt))

  if (results === undefined || results.length === 0) return []

  return results.map((row) => ({
    ...row,
    id: String(row.id),
    artistaId: String(row.artistaId),
    rrss: row.rrss ? JSON.parse(row.rrss) : null
  }))
}
