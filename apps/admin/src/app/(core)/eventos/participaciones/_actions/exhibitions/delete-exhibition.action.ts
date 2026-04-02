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
  getParticipationExhibitionsCacheTag
} from '../../_constants/cache-tags'

const { participationExhibition, editionParticipation } = participations

export async function deleteExhibitionAction(
  _prevState: ActionState,
  data: { id: number }
): Promise<ActionState> {
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
      // 1. Get the exhibition record to find its parent participation
      const expo = await tx.query.participationExhibition.findFirst({
        where: (t, { eq }) => eq(t.id, id),
        with: {
          participacion: {
            columns: {
              edicionId: true
            }
          }
        }
      })

      if (!expo) throw new Error('Expositor no encontrado')

      const currentParticipationId = expo.participacionId

      participationId = currentParticipationId
      editionId = expo.participacion?.edicionId ?? null

      // 2. Delete the exhibition record
      await tx
        .delete(participationExhibition)
        .where(eq(participationExhibition.id, id))

      // 3. Check if the parent participation has any other linked records (like activities)
      const linkedActivities = await tx.query.participationActivity.findMany({
        where: (t, { eq }) => eq(t.participacionId, currentParticipationId)
      })

      // If no other activities exist for this artist/edition, delete the master participation record
      if (linkedActivities.length === 0) {
        await tx
          .delete(editionParticipation)
          .where(eq(editionParticipation.id, currentParticipationId))
      }
    })

    if (editionId !== null) {
      updateTag(getEditionParticipationsCacheTag(editionId))
    }

    if (participationId !== null) {
      updateTag(getParticipationExhibitionsCacheTag(participationId))
    }

    return { success: true }
  } catch (error) {
    console.error('[deleteExhibitionAction]', error)
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
