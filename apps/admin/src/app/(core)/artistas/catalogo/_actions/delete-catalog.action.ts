'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'
import type { RevalidateWebCacheOptions } from '@/shared/lib/web-invalidation'
import { deleteCatalogEntry } from '@/shared/lib/catalog-artist-deletion'
import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
} from '@frijolmagico/cache-tags'
import type { ActionState } from '@/shared/types/actions'

export async function deleteCatalogAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    const { wasFeatured, wasActive } = await db.transaction(async (tx) =>
      deleteCatalogEntry(tx, id),
    )
    const invalidationRequests: RevalidateWebCacheOptions[] = []

    if (wasActive) {
      invalidationRequests.push(
        {
          tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
          mode: 'immediate',
        },
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate',
        },
      )
    }

    for (const tag of [CATALOG_BASE_CACHE_TAG, CATALOG_PARTICIPATION_CACHE_TAG, CATALOG_CACHE_TAG]) {
      updateTag(tag)
      invalidationRequests.push({ tag })
    }

    if (wasFeatured) {
      invalidationRequests.push({ tag: FEATURED_ARTISTS_CACHE_TAG })
    }

    const webInvalidation = await revalidateWebCacheBatch(
      invalidationRequests,
      'delete-catalog'
    )

    return { success: true, ...webInvalidation }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'catalogo',
          message:
            error instanceof Error
              ? error.message
              : 'Error desconocido al eliminar del catálogo',
        },
      ],
    }
  }
}
