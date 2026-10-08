'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  COLLECTIVE_ACTIVE_CACHE_TAG,
  COLLECTIVE_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'
import type { ActionState } from '@/shared/types/actions'
import {
  collectiveInsertSchema,
  type CollectiveInsertInput
} from '../_schemas/collective.schema'

const { collective } = artist

export async function createCollectiveAction(
  _prevState: ActionState,
  data: CollectiveInsertInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = collectiveInsertSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'agrupacion',
          message: issue.message
        }))
      }
    }

    await db.insert(collective).values(parsed.data)

    updateTag(COLLECTIVE_CACHE_TAG)
    updateTag(COLLECTIVE_ACTIVE_CACHE_TAG)
    const webInvalidation = await revalidateWebCacheBatch(
      [
        { tag: CATALOG_BASE_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG },
        { tag: CATALOG_CACHE_TAG }
      ],
      'create-collective'
    )

    return {
      success: true,
      ...(webInvalidation.webRevalidation
        ? { webRevalidation: webInvalidation.webRevalidation }
        : {})
    }
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
