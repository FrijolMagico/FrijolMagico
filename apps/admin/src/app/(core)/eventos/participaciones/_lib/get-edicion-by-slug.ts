import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { desc } from 'drizzle-orm'
import { EDITION_CACHE_TAG } from '@/core/eventos/ediciones/_constants'

const { eventEdition } = events

export interface EdicionLookupResult {
  id: number
  slug: string | null
}

export async function getEdicionIdFromSlugOrLatest(
  slug?: string
): Promise<EdicionLookupResult | null> {
  'use cache'
  cacheTag(EDITION_CACHE_TAG)

  if (slug) {
    const found = await db.query.eventEdition.findFirst({
      where: (table, { eq }) => eq(table.slug, slug),
      columns: { id: true, slug: true }
    })

    return found ? { id: found.id, slug: found.slug } : null
  }

  const latest = await db.query.eventEdition.findFirst({
    orderBy: () => [desc(eventEdition.id)],
    columns: { id: true, slug: true }
  })

  return latest ? { id: latest.id, slug: latest.slug } : null
}
