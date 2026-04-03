import 'server-only'
import { cacheTag } from 'next/cache'
import { asc, isNotNull } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'

import { parseRRSS } from '@/shared/lib/rrss'

import { ARTIST_CACHE_TAG, type ARTIST_STATUS } from '../_constants'
import type { ArtistListItem } from '../_types/artist'

const { artist: artistTable } = artist

interface DeletedArtistRow {
  id: number
  pseudonimo: string
  nombre: string | null
  rut: string | null
  telefono: string | null
  correo: string | null
  ciudad: string | null
  pais: string | null
  estadoId: number
  rrss: string | null
  deletedAt: string | null
}

function mapDeletedArtistRow(row: DeletedArtistRow): ArtistListItem {
  return {
    ...row,
    estadoId: row.estadoId as ARTIST_STATUS,
    rrss: parseRRSS(row.rrss)
  }
}

export async function getDeletedArtists(): Promise<ArtistListItem[]> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  const results = await db
    .select({
      id: artistTable.id,
      pseudonimo: artistTable.pseudonimo,
      nombre: artistTable.nombre,
      rut: artistTable.rut,
      telefono: artistTable.telefono,
      correo: artistTable.correo,
      ciudad: artistTable.ciudad,
      pais: artistTable.pais,
      estadoId: artistTable.estadoId,
      rrss: artistTable.rrss,
      deletedAt: artistTable.deletedAt
    })
    .from(artistTable)
    .where(isNotNull(artistTable.deletedAt))
    .orderBy(asc(artistTable.createdAt))
    .limit(100)

  if (results === undefined || results.length === 0) {
    return []
  }

  return results.map(mapDeletedArtistRow)
}
