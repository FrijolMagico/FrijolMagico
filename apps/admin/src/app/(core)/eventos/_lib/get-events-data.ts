import 'server-only'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { eq, asc } from 'drizzle-orm'
import { cacheTag } from 'next/cache'
import { EVENT_CACHE_TAG } from '../_constants'
import type { Event } from '../_schemas/event.schema'
import { ORGANIZATION_ID } from '@/core/organizacion/_constants'

const { event } = events

export async function getEvents(): Promise<Event[] | null> {
  'use cache'
  cacheTag(EVENT_CACHE_TAG)

  const results = await db
    .select({
      id: event.id,
      organizacionId: event.organizacionId,
      nombre: event.nombre,
      slug: event.slug,
      descripcion: event.descripcion
    })
    .from(event)
    .where(eq(event.organizacionId, ORGANIZATION_ID))
    .orderBy(asc(event.createdAt))

  if (results === undefined) return null

  return results
}
