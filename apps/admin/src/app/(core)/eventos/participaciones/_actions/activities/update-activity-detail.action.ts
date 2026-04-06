'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { getParticipationActivitiesCacheTag } from '../../_constants/cache-tags'
import {
  activityDetailUpdateSchema,
  type ActivityDetailUpdateInput
} from '../../_schemas/activity.schema'

const { activity } = participations

export async function updateActivityDetailAction(
  participationId: number,
  payload: ActivityDetailUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = activityDetailUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'detalles',
          message: issue.message
        }))
      }
    }

    await db
      .update(activity)
      .set(parsed.data)
      .where(eq(activity.id, parsed.data.id))

    updateTag(getParticipationActivitiesCacheTag(participationId))

    return { success: true }
  } catch (error) {
    console.error('[updateDetallesAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'detalles',
          message:
            error instanceof Error
              ? error.message
              : 'Error al actualizar los detalles'
        }
      ]
    }
  }
}
