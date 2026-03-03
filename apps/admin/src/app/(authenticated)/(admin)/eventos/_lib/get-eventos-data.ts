'use server'

import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { eq, asc } from 'drizzle-orm'
import { cacheTag } from 'next/cache'
import type { EventoEntry } from '../_types'
import { EVENTO_CACHE_TAG } from '../_constants'

const { evento } = events

export async function getEventos(): Promise<EventoEntry[] | null> {
  'use cache'
  cacheTag(EVENTO_CACHE_TAG)

  const results = await db
    .select()
    .from(evento)
    .where(eq(evento.organizacionId, 1))
    .orderBy(asc(evento.nombre))

  if (results === undefined) return null

  return results.map((row) => ({
    id: String(row.id),
    organizacionId: row.organizacionId!,
    nombre: row.nombre,
    slug: row.slug,
    descripcion: row.descripcion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }))
}
