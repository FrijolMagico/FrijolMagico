'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  AGRUPACION_ACTIVE_CACHE_TAG,
  AGRUPACION_CACHE_TAG,
  AGRUPACION_DELETED_CACHE_TAG
} from '../_constants'
import {
  agrupacionUpdateSchema,
  type AgrupacionUpdateInput
} from '../_schemas/agrupacion.schema'

const { collective } = artist

export async function updateAgrupacionAction(
  _prevState: ActionState,
  data: AgrupacionUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = agrupacionUpdateSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'agrupacion',
          message: issue.message
        }))
      }
    }

    if (!parsed.data.id) {
      return {
        success: false,
        errors: [{ entityType: 'agrupacion', message: 'ID inválido' }]
      }
    }

    await db.update(collective).set(parsed.data).where(eq(collective.id, parsed.data.id))

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
