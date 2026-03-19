import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { asc, eq } from 'drizzle-orm'

import { ARTIST_CACHE_TAG } from '@/core/artistas/_constants'

const { artist: artistTable, artistStatus } = artist

export interface ArtistaLookup {
  id: string
  pseudonimo: string
  nombre: string | null
  estadoSlug: string
  fotoUrl: string | null
}

export async function getArtistasLookup(): Promise<ArtistaLookup[]> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  const results = await db
    .select({
      id: artistTable.id,
      pseudonimo: artistTable.pseudonimo,
      nombre: artistTable.nombre,
      estadoSlug: artistStatus.slug
    })
    .from(artistTable)
    .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
    .where(isNotDeleted(artistTable.deletedAt))
    .orderBy(asc(artistTable.pseudonimo))

  return results.map((row) => ({
    id: String(row.id),
    pseudonimo: row.pseudonimo,
    nombre: row.nombre,
    estadoSlug: row.estadoSlug ?? 'desconocido',
    fotoUrl: null
  }))
}
