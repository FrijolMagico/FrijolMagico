'use server'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { asc, eq } from 'drizzle-orm'

import type { ArtistEntry } from '../_types'
import { ARTISTA_CACHE_TAG } from '../_constants'

const { artista, artistaEstado } = artist

export async function getArtists(): Promise<ArtistEntry[] | null> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG)

  const results = await db
    .select({
      artista: artista,
      estadoSlug: artistaEstado.slug
    })
    .from(artista)
    .leftJoin(artistaEstado, eq(artista.estadoId, artistaEstado.id))
    .orderBy(asc(artista.pseudonimo))

  if (results === undefined || results.length === 0) return null

  return results.map((row) => ({
    ...row.artista,
    estadoSlug: row.estadoSlug ?? 'desconocido',
    id: String(row.artista.id),
    rrss: row.artista.rrss ? JSON.parse(row.artista.rrss) : null
  }))
}
