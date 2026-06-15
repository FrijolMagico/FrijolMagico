'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import { deleteCatalogEntry } from '@/shared/lib/catalog-artist-deletion'
import {
  CATALOG_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
} from '@frijolmagico/cache-tags'
import type { ActionState } from '@/shared/types/actions'

export async function deleteCatalogAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    const { wasFeatured } = await db.transaction(async (tx) =>
      deleteCatalogEntry(tx, id),
    )

    updateTag(CATALOG_CACHE_TAG)
    void revalidateWebCache({ tag: CATALOG_CACHE_TAG, path: '/catalogo' })

    if (wasFeatured) {
      void revalidateWebCache({
        tag: FEATURED_ARTISTS_CACHE_TAG,
        path: '/',
      })
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
              : 'Error desconocido al eliminar del catálogo',
        },
      ],
    }
  }
}
