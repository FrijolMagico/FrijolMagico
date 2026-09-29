'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { CATALOG_CACHE_TAG } from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'

export async function reorderCatalogAction(
  reorders: Array<{ id: number; orden: string }>
): Promise<ActionState> {
  await requireAuth()

  const changed = await db.transaction(async (tx) => {
    let hasChanges = false
    for (const item of reorders) {
      const [existing] = await tx
        .select({ orden: artist.catalogArtist.orden })
        .from(artist.catalogArtist)
        .where(eq(artist.catalogArtist.id, item.id))
      if (existing?.orden === item.orden) continue
      await tx
        .update(artist.catalogArtist)
        .set({ orden: item.orden })
        .where(eq(artist.catalogArtist.id, item.id))
      if (existing) hasChanges = true
    }
    return hasChanges
  })

  if (changed) {
    updateTag(CATALOG_CACHE_TAG)
    void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
  }

  return { success: true }
}
