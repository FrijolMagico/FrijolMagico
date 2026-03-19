import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { DISCIPLINAS_CACHE_TAG } from '../_constants'

const { discipline } = core

export interface DisciplinaLookup {
  id: string
  nombre: string
}

export async function getDisciplinas(): Promise<DisciplinaLookup[]> {
  'use cache'
  cacheTag(DISCIPLINAS_CACHE_TAG)

  const results = await db
    .select({ id: discipline.id, nombre: discipline.slug })
    .from(discipline)
    .orderBy(asc(discipline.slug))

  return results.map((row) => ({
    id: String(row.id),
    nombre: row.nombre
  }))
}
