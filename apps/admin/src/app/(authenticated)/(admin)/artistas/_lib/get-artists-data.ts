'use server'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import type { ArtistEntry } from '../_types'
import { ARTISTA_CACHE_TAG } from '../_constants'

const { artista } = artist

export async function getArtists(): Promise<ArtistEntry[] | null> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG)

  const results = await db
    .select()
    .from(artista)
    .orderBy(asc(artista.pseudonimo))

  if (results === undefined) return null

  return results.map((row) => ({
    ...row,
    id: String(row.id),
    rrss: row.rrss ? JSON.parse(row.rrss) : null
  }))
}
