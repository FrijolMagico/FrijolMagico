'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  ARTIST_DETAIL_CACHE_TAG,
  CATALOG_CACHE_TAG,
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  getEditionParticipationsCacheTag,
  getParticipationActivitiesCacheTag
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
import { deleteOrphanedEditionParticipation } from '../participations/delete-orphaned-edition-participation'

const { participationActivity } = participations
const PUBLIC_ACTIVITY_TAGS = [FESTIVALES_CACHE_TAG, EVENT_CACHE_TAG, EDITION_CACHE_TAG]

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
    let isPublicActivity = false

    await db.transaction(async (tx) => {
      const activity = await tx.query.participationActivity.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        with: { participacion: { columns: { edicionId: true } } }
      })

      if (activity) {
        participationId = activity.participacionId
        editionId = activity.participacion?.edicionId ?? null
        isPublicActivity =
          activity.estado === 'confirmado' || activity.estado === 'completado'
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

    try {
      updateTag(getEditionParticipationsCacheTag(editionId))
      updateTag(getParticipationActivitiesCacheTag(participationId))
      updateTag(ARTIST_DETAIL_CACHE_TAG)
    } catch (error) {
      console.error('[deleteActivityAction] Local invalidation failed', error)
    }
    for (const tag of PUBLIC_ACTIVITY_TAGS) {
      try {
        updateTag(tag)
      } catch (error) {
        console.error('[deleteActivityAction] Local invalidation failed', { tag, error })
      }
    }
    for (const tag of PUBLIC_ACTIVITY_TAGS) {
      void revalidateWebCacheBestEffort({ tag })
    }
    if (isPublicActivity) {
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
    }

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
