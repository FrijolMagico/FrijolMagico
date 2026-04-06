import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { COLLECTIVES_CACHE_TAG } from '@/core/eventos/participaciones/_constants/cache-tags'
import type { CollectiveLookup } from '@/core/eventos/participaciones/_types/participations.types'

const { collective } = artist

export async function getCollectivesLookup(): Promise<
  Map<number, CollectiveLookup>
> {
  'use cache'
  cacheTag(COLLECTIVES_CACHE_TAG)

  const results = await db
    .select({ id: collective.id, name: collective.nombre })
    .from(collective)
    .orderBy(asc(collective.nombre))

  return new Map(results.map((row) => [row.id, row]))
}
