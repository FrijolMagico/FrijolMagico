import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { DISCIPLINAS_CACHE_TAG } from '../_constants'

const { discipline } = core

export async function getDisciplinas(): Promise<Map<number, string>> {
  'use cache'
  cacheTag(DISCIPLINAS_CACHE_TAG)

  const results = await db
    .select({ id: discipline.id, nombre: discipline.slug })
    .from(discipline)
    .orderBy(asc(discipline.slug))

  return new Map(results.map((row) => [row.id, row.nombre]))
}
