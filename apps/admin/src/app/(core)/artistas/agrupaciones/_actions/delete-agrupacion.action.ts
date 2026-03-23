'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  AGRUPACION_ACTIVE_CACHE_TAG,
  AGRUPACION_CACHE_TAG,
  AGRUPACION_DELETED_CACHE_TAG
} from '../_constants'

const { collective } = artist

export async function deleteAgrupacionAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    await db
      .update(collective)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(collective.id, id), isNull(collective.deletedAt)))

    updateTag(AGRUPACION_CACHE_TAG)
    updateTag(AGRUPACION_ACTIVE_CACHE_TAG)
    updateTag(AGRUPACION_DELETED_CACHE_TAG)

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
