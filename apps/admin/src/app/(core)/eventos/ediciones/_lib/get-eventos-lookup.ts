import 'server-only'
import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'
import { EVENT_CACHE_TAG } from '../../_constants'
import type { EventoLookup } from '../_types'

const { event } = events

export async function getEventosLookup(): Promise<EventoLookup[]> {
  'use cache'
  cacheTag(EVENT_CACHE_TAG)

  return db
    .select({
      id: event.id,
      nombre: event.nombre,
      slug: event.slug
    })
    .from(event)
    .orderBy(asc(event.nombre))
}
