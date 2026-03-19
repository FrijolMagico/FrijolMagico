'use server'

import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { PARTICIPACIONES_CACHE_TAG } from '../../_constants'

const { participationActivity, editionParticipation } = participations

export async function deleteActividadAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth()

    const id = Number(formData.get('id'))
    if (!id) {
      return {
        success: false,
        errors: [{ entityType: 'participacion', message: 'ID requerido' }]
      }
    }

    await db.transaction(async (tx) => {
      // 1. Get the activity record to find its parent participation
      const act = await tx.query.participationActivity.findFirst({
        where: (t, { eq }) => eq(t.id, id)
      })

      if (!act) throw new Error('Actividad no encontrada')

      const participacionId = act.participacionId

      // 2. Delete the activity record (DB cascade handles the concrete activity table)
      await tx
        .delete(participationActivity)
        .where(eq(participationActivity.id, id))

      // 3. Check if the parent participation has any other linked records
      const linkedExhibitions = await tx.query.participationExhibition.findMany(
        {
          where: (t, { eq }) => eq(t.participacionId, participacionId)
        }
      )

      const otherLinkedActivities =
        await tx.query.participationActivity.findMany({
          where: (t, { eq }) => eq(t.participacionId, participacionId)
        })

      // If no other activities or exhibitions exist, delete the master participation record
      if (
        linkedExhibitions.length === 0 &&
        otherLinkedActivities.length === 0
      ) {
        await tx
          .delete(editionParticipation)
          .where(eq(editionParticipation.id, participacionId))
      }
    })

    updateTag(PARTICIPACIONES_CACHE_TAG)

    return { success: true }
  } catch (error) {
    console.error('[deleteActividadAction]', error)
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
