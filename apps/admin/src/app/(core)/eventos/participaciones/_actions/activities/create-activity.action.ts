'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import {
  getEditionParticipationsCacheTag,
  getParticipationActivitiesCacheTag
} from '../../_constants/cache-tags'
import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'
import {
  type ActivityDetailInsertInput,
  activityDetailInsertSchema,
  type ActivityInsertInput,
  activityInsertSchema
} from '../../_schemas/activity.schema'
import {
  editionParticipationInsertSchema,
  type ParticipationInsertInput
} from '../../_schemas/edition-participation.schema'

const { participationActivity, activity } = participations

interface CreateActivityActionInput {
  participation: ParticipationInsertInput
  activity: Omit<ActivityInsertInput, 'participacionId'>
  detail: Omit<ActivityDetailInsertInput, 'participacionActividadId'>
}

export async function createActivityAction(
  data: CreateActivityActionInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = editionParticipationInsertSchema.safeParse(
      data.participation
    )

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'participacion',
          message: issue.message
        }))
      }
    }

    let participationId: number | null = null

    await db.transaction(async (tx) => {
      const participationRecord = await findOrCreateEditionParticipation(
        tx,
        parsed.data
      )

      participationId = participationRecord.id

      if (!participationId) {
        throw new Error('Error al crear o encontrar la participación')
      }

      const participationActivityValues = activityInsertSchema.parse({
        participacionId: participationRecord.id,
        ...data.activity
      })

      const [insertedActivity] = await tx
        .insert(participationActivity)
        .values(participationActivityValues)
        .returning({ id: participationActivity.id })

      const activityDetailsValues = activityDetailInsertSchema.parse({
        participacionActividadId: insertedActivity.id,
        ...data.detail
      })

      await tx.insert(activity).values(activityDetailsValues)
    })

    updateTag(getEditionParticipationsCacheTag(parsed.data.edicionId))
    if (participationId !== null) {
      updateTag(getParticipationActivitiesCacheTag(participationId))
    }

    return { success: true }
  } catch (error) {
    console.error('[createActivityAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'participacion',
          message:
            error instanceof Error
              ? error.message
              : 'Error al guardar la actividad'
        }
      ]
    }
  }
}
