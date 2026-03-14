import 'server-only'
import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'

import { ARTISTA_CACHE_TAG } from '../_constants'
import { Artist } from '../_schemas/artista.schema'
import { isNull } from 'drizzle-orm'

const { artist: artistTable } = artist

export async function getArtists(): Promise<Artist[] | null> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG)

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
      rrss: artistTable.rrss
    })
    .from(artistTable)
    .where(isNull(artistTable.deletedAt))

  if (results === undefined || results.length === 0) return null

  return results.map((row) => ({
    ...row,
    rrss: row.rrss ? JSON.parse(row.rrss) : null
  }))
}
