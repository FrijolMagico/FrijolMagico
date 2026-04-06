import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { ACTIVITY_TYPES_CACHE_TAG } from '@/core/eventos/participaciones/_constants/cache-tags'

const { activityType } = participations

export async function getActivityTypes(): Promise<Map<number, string>> {
  'use cache'
  cacheTag(ACTIVITY_TYPES_CACHE_TAG)

  const results = await db
    .select({ id: activityType.id, slug: activityType.slug })
    .from(activityType)
    .orderBy(asc(activityType.slug))

  return new Map(results.map((row) => [row.id, row.slug]))
}
