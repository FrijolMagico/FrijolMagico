import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { DISCIPLINES_CACHE_TAG } from '@/core/eventos/participaciones/_constants/cache-tags'

const { discipline } = core

export async function getDisciplinesLookup(): Promise<Map<number, string>> {
  'use cache'
  cacheTag(DISCIPLINES_CACHE_TAG)

  const results = await db
    .select({ id: discipline.id, nombre: discipline.slug })
    .from(discipline)
    .orderBy(asc(discipline.slug))

  return new Map(results.map((row) => [row.id, row.nombre]))
}
