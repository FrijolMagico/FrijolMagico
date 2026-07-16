'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  getEditionParticipationsCacheTag,
  getParticipationActivitiesCacheTag
} from '@frijolmagico/cache-tags'
import { deleteOrphanedEditionParticipation } from '../participations/delete-orphaned-edition-participation'

const { participationActivity } = participations

interface DeleteActivityInput {
  id: number
}

interface DeleteAssignmentResult {
  alreadyAbsent: boolean
  participationDeleted: boolean
}

function hasValidId(id: number | undefined): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0
}

export async function deleteActivityAction(
  data: DeleteActivityInput
): Promise<ActionState<DeleteAssignmentResult>> {
  try {
    await requireAuth()

    const id = data.id
    if (!hasValidId(id)) {
      return {
        success: false,
        errors: [{ entityType: 'participacion', message: 'ID requerido' }]
      }
    }

    let participationId: number | null = null
    let editionId: number | null = null
    let alreadyAbsent = false
    let participationDeleted = false

    await db.transaction(async (tx) => {
      const activity = await tx.query.participationActivity.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        with: { participacion: { columns: { edicionId: true } } }
      })

      if (activity) {
        participationId = activity.participacionId
        editionId = activity.participacion?.edicionId ?? null
        if (editionId === null) throw new Error('Participación no encontrada')

        await tx
          .delete(participationActivity)
          .where(eq(participationActivity.id, id))
        participationDeleted = await deleteOrphanedEditionParticipation(
          tx,
          participationId
        )
        return
      }

      alreadyAbsent = true
    })

    if (alreadyAbsent) {
      return { success: true, data: { alreadyAbsent, participationDeleted } }
    }

    if (editionId === null || participationId === null) {
      throw new Error('Participación no encontrada')
    }

    updateTag(getEditionParticipationsCacheTag(editionId))
    updateTag(getParticipationActivitiesCacheTag(participationId))

    return { success: true, data: { alreadyAbsent, participationDeleted } }
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
