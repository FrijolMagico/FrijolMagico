'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { getParticipationActivitiesCacheTag } from '../../_constants/cache-tags'
import {
  activityUpdateSchema,
  type ActivityUpdateInput
} from '../../_schemas/activity.schema'

const { participationActivity } = participations

export async function updateActivityAction(
  payload: ActivityUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = activityUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'actividad',
          message: issue.message
        }))
      }
    }

    await db
      .update(participationActivity)
      .set(parsed.data)
      .where(eq(participationActivity.id, parsed.data.id))

    updateTag(getParticipationActivitiesCacheTag(parsed.data.participacionId))

    return { success: true }
  } catch (error) {
    console.error('[updateActivityAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'actividad',
          message:
            error instanceof Error
              ? error.message
              : 'Error al actualizar la actividad'
        }
      ]
    }
  }
}
