'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, sql } from 'drizzle-orm'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { CATALOG_CACHE_TAG } from '../_constants'

export async function deleteCatalogAction(id: number): Promise<ActionState> {
  await requireAuth()

  await db
    .update(artist.catalogArtist)
    .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
    .where(
      and(
        eq(artist.catalogArtist.id, id),
        isNotDeleted(artist.catalogArtist.deletedAt)
      )
    )

  updateTag(CATALOG_CACHE_TAG)

  return { success: true }
}
