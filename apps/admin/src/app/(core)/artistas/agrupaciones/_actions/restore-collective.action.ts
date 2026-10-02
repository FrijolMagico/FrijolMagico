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
  CATALOG_PARTICIPATION_CACHE_TAG,
  COLLECTIVE_ACTIVE_CACHE_TAG,
  COLLECTIVE_CACHE_TAG,
  COLLECTIVE_DELETED_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
import type { ActionState } from '@/shared/types/actions'

const { collective } = artist

export async function restoreCollectiveAction(
  id: number
): Promise<ActionState> {
  try {
    await requireAuth()

    const restored = await db
      .update(collective)
      .set({ deletedAt: null })
      .where(and(eq(collective.id, id), isNotNull(collective.deletedAt)))
      .returning({ id: collective.id })

    if (restored.length > 0) {
      updateTag(COLLECTIVE_CACHE_TAG)
      updateTag(COLLECTIVE_ACTIVE_CACHE_TAG)
      updateTag(COLLECTIVE_DELETED_CACHE_TAG)
      void revalidateWebCacheBestEffort({ tag: CATALOG_BASE_CACHE_TAG })
      void revalidateWebCacheBestEffort({ tag: CATALOG_PARTICIPATION_CACHE_TAG })
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'agrupacion',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
