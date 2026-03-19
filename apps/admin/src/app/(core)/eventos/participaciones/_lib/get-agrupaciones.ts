import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { AGRUPACIONES_CACHE_TAG } from '../_constants'

const { collective } = artist

export interface AgrupacionLookup {
  id: string
  nombre: string
}

export async function getAgrupaciones(): Promise<AgrupacionLookup[]> {
  'use cache'
  cacheTag(AGRUPACIONES_CACHE_TAG)

  const results = await db
    .select({ id: collective.id, nombre: collective.nombre })
    .from(collective)
    .orderBy(asc(collective.nombre))

  return results.map((row) => ({
    id: String(row.id),
    nombre: row.nombre
  }))
}
