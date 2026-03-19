import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { ACTIVITY_TYPES_CACHE_TAG } from '../_constants'

const { activityType } = participations

export interface ActivityTypeLookup {
  id: string
  nombre: string
}

export async function getActivityTypes(): Promise<ActivityTypeLookup[]> {
  'use cache'
  cacheTag(ACTIVITY_TYPES_CACHE_TAG)

  const results = await db
    .select({ id: activityType.id, nombre: activityType.slug })
    .from(activityType)
    .orderBy(asc(activityType.slug))

  return results.map((row) => ({
    id: String(row.id),
    nombre: row.nombre
  }))
}
