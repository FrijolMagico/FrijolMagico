'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import {
  getEditionParticipationsCacheTag,
  getParticipationActivitiesCacheTag
} from '../../_constants/cache-tags'

const { participationActivity, editionParticipation } = participations

export async function deleteActivityAction(data: {
  id: number
}): Promise<ActionState> {
  try {
    await requireAuth()

    const id = data.id
    if (!id) {
      return {
        success: false,
        errors: [{ entityType: 'participacion', message: 'ID requerido' }]
      }
    }

    let participationId: number | null = null
    let editionId: number | null = null

    await db.transaction(async (tx) => {
      // 1. Get the activity record to find its parent participation
      const act = await tx.query.participationActivity.findFirst({
        where: (t, { eq }) => eq(t.id, id),
        with: {
          participacion: {
            columns: {
              edicionId: true
            }
          }
        }
      })

      if (!act) throw new Error('Actividad no encontrada')

      const currentParticipationId = act.participacionId

      participationId = currentParticipationId
      editionId = act.participacion?.edicionId ?? null

      // 2. Delete the activity record (DB cascade handles the concrete activity table)
      await tx
        .delete(participationActivity)
        .where(eq(participationActivity.id, id))

      // 3. Check if the parent participation has any other linked records
      const linkedExhibitions = await tx.query.participationExhibition.findMany(
        {
          where: (t, { eq }) => eq(t.participacionId, currentParticipationId)
        }
      )

      const otherLinkedActivities =
        await tx.query.participationActivity.findMany({
          where: (t, { eq }) => eq(t.participacionId, currentParticipationId)
        })

      // If no other activities or exhibitions exist, delete the master participation record
      if (
        linkedExhibitions.length === 0 &&
        otherLinkedActivities.length === 0
      ) {
        await tx
          .delete(editionParticipation)
          .where(eq(editionParticipation.id, currentParticipationId))
      }
    })

    if (editionId !== null) {
      updateTag(getEditionParticipationsCacheTag(editionId))
    }

    if (participationId !== null) {
      updateTag(getParticipationActivitiesCacheTag(participationId))
    }

    return { success: true }
  } catch (error) {
    console.error('[deleteActivityAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'participacion',
          message: error instanceof Error ? error.message : 'Error al eliminar'
        }
      ]
    }
  }
}
