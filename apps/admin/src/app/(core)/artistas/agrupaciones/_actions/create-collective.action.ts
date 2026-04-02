'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  COLLECTIVE_ACTIVE_CACHE_TAG,
  COLLECTIVE_CACHE_TAG
} from '../_constants'
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
