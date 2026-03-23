'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  AGRUPACION_ACTIVE_CACHE_TAG,
  AGRUPACION_CACHE_TAG
} from '../_constants'
import {
  agrupacionInsertSchema,
  type AgrupacionInsertInput
} from '../_schemas/agrupacion.schema'

const { collective } = artist

export async function createAgrupacionAction(
  _prevState: ActionState,
  data: AgrupacionInsertInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = agrupacionInsertSchema.safeParse(data)

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

    updateTag(AGRUPACION_CACHE_TAG)
    updateTag(AGRUPACION_ACTIVE_CACHE_TAG)

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
