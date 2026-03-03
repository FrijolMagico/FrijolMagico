'use server'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { events, core } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import type { EdicionEntry, EdicionDiaEntry, LugarEntry } from '../_types'
import { EVENTO_EDICION_CACHE_TAG, LUGAR_CACHE_TAG } from '../../_constants'

const { eventoEdicion, eventoEdicionDia } = events
const { place } = core

export async function getEdiciones(): Promise<{
  ediciones: EdicionEntry[]
  dias: EdicionDiaEntry[]
} | null> {
  'use cache'
  cacheTag(EVENTO_EDICION_CACHE_TAG)

  const edicionesResults = await db
    .select()
    .from(eventoEdicion)
    .orderBy(asc(eventoEdicion.createdAt))

  const diasResults = await db
    .select()
    .from(eventoEdicionDia)
    .orderBy(asc(eventoEdicionDia.fecha))

  if (edicionesResults === undefined || diasResults === undefined) return null

  const ediciones: EdicionEntry[] = edicionesResults
    .filter(
      (row): row is typeof row & { eventoId: number } => row.eventoId !== null
    )
    .map((row) => ({
      ...row,
      id: String(row.id),
      eventoId: String(row.eventoId)
    }))

  const dias: EdicionDiaEntry[] = diasResults.map((row) => ({
    ...row,
    id: String(row.id),
    eventoEdicionId: String(row.eventoEdicionId),
    lugarId: row.lugarId ? String(row.lugarId) : null
  }))

  return { ediciones, dias }
}

export async function getLugares(): Promise<LugarEntry[] | null> {
  'use cache'
  cacheTag(LUGAR_CACHE_TAG)

  const results = await db.select().from(place).orderBy(asc(place.nombre))

  if (results === undefined || results.length === 0) return null

  return results.map((row) => ({
    ...row,
    id: String(row.id)
  }))
}
