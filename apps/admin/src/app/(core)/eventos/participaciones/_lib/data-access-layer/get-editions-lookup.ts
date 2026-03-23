import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { asc, eq } from 'drizzle-orm'
import { EDITION_CACHE_TAG } from '@/core/eventos/ediciones/_constants'

const { event, eventEdition } = events

export interface EdicionOption {
  id: number
  nombre: string | null
  slug: string | null
  eventoNombre: string
}

export async function getEditionsLookup(): Promise<EdicionOption[]> {
  'use cache'
  cacheTag(EDITION_CACHE_TAG)

  const results = await db
    .select({
      id: eventEdition.id,
      nombre: eventEdition.nombre,
      slug: eventEdition.slug,
      eventoNombre: event.nombre
    })
    .from(eventEdition)
    .leftJoin(event, eq(eventEdition.eventoId, event.id))
    .orderBy(asc(eventEdition.id))

  return results.map((row) => ({
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    eventoNombre: row.eventoNombre ?? ''
  }))
}
