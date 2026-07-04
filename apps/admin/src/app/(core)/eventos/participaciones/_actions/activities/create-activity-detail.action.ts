'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { getParticipationActivitiesCacheTag } from '@frijolmagico/cache-tags'
import {
  activityDetailInsertSchema,
  type ActivityDetailInsertInput
} from '../../_schemas/activity.schema'

const { activity } = participations

export async function createActivityDetailAction(
  participationId: number,
  payload: ActivityDetailInsertInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = activityDetailInsertSchema.safeParse(payload)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'detalles',
          message: issue.message
        }))
      }
    }

    await db.insert(activity).values(parsed.data)

    updateTag(getParticipationActivitiesCacheTag(participationId))

    return { success: true }
  } catch (error) {
    console.error('[createActivityDetailAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'detalles',
          message:
            error instanceof Error
              ? error.message
              : 'Error al guardar los detalles'
        }
      ]
    }
  }
}
