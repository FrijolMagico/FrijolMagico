'use server'

import 'server-only'

import { updateTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, isNotNull } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'
import type { RevalidateWebCacheOptions } from '@/shared/lib/web-invalidation'
import type { ActionState } from '@/shared/types/actions'

export async function restoreCatalogAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    const restored = await db
      .update(artist.catalogArtist)
      .set({ deletedAt: null })
      .where(
        and(
          eq(artist.catalogArtist.id, id),
          isNotNull(artist.catalogArtist.deletedAt)
        )
      )
      .returning({ id: artist.catalogArtist.id })

    if (restored.length > 0) {
      const tags = [CATALOG_BASE_CACHE_TAG, CATALOG_PARTICIPATION_CACHE_TAG, CATALOG_CACHE_TAG]
      const invalidationRequests: RevalidateWebCacheOptions[] = tags.map((tag) => ({ tag }))

      for (const tag of tags) updateTag(tag)

      const webInvalidation = await revalidateWebCacheBatch(
        invalidationRequests,
        'restore-catalog'
      )
      return { success: true, ...webInvalidation }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'catalogo',
          message:
            error instanceof Error
              ? error.message
              : 'Error desconocido al restaurar el catálogo'
        }
      ]
    }
  }
}
