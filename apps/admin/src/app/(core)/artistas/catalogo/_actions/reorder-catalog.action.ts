'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { CATALOG_CACHE_TAG } from '../_constants'

export async function reorderCatalogAction(
  reorders: Array<{ id: number; orden: string }>
): Promise<ActionState> {
  await requireAuth()

  await db.transaction(async (tx) => {
    for (const item of reorders) {
      await tx
        .update(artist.catalogArtist)
        .set({ orden: item.orden })
        .where(eq(artist.catalogArtist.id, item.id))
    }
  })

  updateTag(CATALOG_CACHE_TAG)

  return { success: true }
}
