import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { desc, eq } from 'drizzle-orm'
import { EDITION_CACHE_TAG } from '@/core/eventos/ediciones/_constants'
import { EVENT_CACHE_TAG } from '@/core/eventos/_constants'
import type { EditionLookup } from '@/core/eventos/participaciones/_types/participations.types'

const { event, eventEdition } = events

export async function getEditionsLookup(): Promise<EditionLookup[]> {
  'use cache'
  cacheTag(EDITION_CACHE_TAG)
  cacheTag(EVENT_CACHE_TAG)

  const results = await db
    .select({
      id: eventEdition.id,
      editionNumber: eventEdition.numeroEdicion,
      slug: eventEdition.slug,
      eventName: event.nombre
    })
    .from(eventEdition)
    .innerJoin(event, eq(eventEdition.eventoId, event.id))
    .orderBy(desc(eventEdition.createdAt))

  return results
}
