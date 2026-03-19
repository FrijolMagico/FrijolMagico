'use server'

import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { PARTICIPACIONES_CACHE_TAG } from '../../_constants'

const { participationExhibition, editionParticipation } = participations

export async function deleteExpositorAction(
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
      // 1. Get the exhibition record to find its parent participation
      const expo = await tx.query.participationExhibition.findFirst({
        where: (t, { eq }) => eq(t.id, id)
      })

      if (!expo) throw new Error('Expositor no encontrado')

      const participacionId = expo.participacionId

      // 2. Delete the exhibition record
      await tx
        .delete(participationExhibition)
        .where(eq(participationExhibition.id, id))

      // 3. Check if the parent participation has any other linked records (like activities)
      const linkedActivities = await tx.query.participationActivity.findMany({
        where: (t, { eq }) => eq(t.participacionId, participacionId)
      })

      // If no other activities exist for this artist/edition, delete the master participation record
      if (linkedActivities.length === 0) {
        await tx
          .delete(editionParticipation)
          .where(eq(editionParticipation.id, participacionId))
      }
    })

    updateTag(PARTICIPACIONES_CACHE_TAG)

    return { success: true }
  } catch (error) {
    console.error('[deleteExpositorAction]', error)
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
