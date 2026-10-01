'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  ARTIST_DETAIL_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  getEditionParticipationsCacheTag,
  getParticipationActivitiesCacheTag
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
import {
  activityUpdateSchema,
  type ActivityUpdateInput
} from '../../_schemas/activity.schema'

const { participationActivity } = participations
const PUBLIC_ACTIVITY_TAGS = [FESTIVALES_CACHE_TAG, EVENT_CACHE_TAG, EDITION_CACHE_TAG]

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

    let editionId: number | null = null
    let oldParticipationId: number | null = null
    let changed = false
    let catalogChanged = false
    await db.transaction(async (tx) => {
      const existing = await tx.query.participationActivity.findFirst({
        where: (table, operators) => operators.eq(table.id, parsed.data.id),
        columns: {
          participacionId: true,
          tipoActividadId: true,
          modoIngresoId: true,
          estado: true,
          puntaje: true,
          notas: true
        },
        with: { participacion: { columns: { edicionId: true } } }
      })
      if (!existing) throw new Error('No se encontró la actividad')

      editionId = existing.participacion?.edicionId ?? null
      oldParticipationId = existing.participacionId
      changed =
        existing.participacionId !== parsed.data.participacionId ||
        existing.tipoActividadId !== parsed.data.tipoActividadId ||
        existing.modoIngresoId !== parsed.data.modoIngresoId ||
        existing.estado !== parsed.data.estado ||
        existing.puntaje !== parsed.data.puntaje ||
        existing.notas !== parsed.data.notas
      if (!changed) return

      catalogChanged =
        (['confirmado', 'completado'].includes(existing.estado ?? '') ||
          ['confirmado', 'completado'].includes(parsed.data.estado ?? '')) &&
        (existing.participacionId !== parsed.data.participacionId ||
          existing.tipoActividadId !== parsed.data.tipoActividadId ||
          existing.estado !== parsed.data.estado)
      await tx
        .update(participationActivity)
        .set(parsed.data)
        .where(eq(participationActivity.id, parsed.data.id))
    })

    if (!changed) return { success: true }

    if (editionId !== null) updateTag(getEditionParticipationsCacheTag(editionId))
    if (oldParticipationId !== parsed.data.participacionId && oldParticipationId !== null) {
      updateTag(getParticipationActivitiesCacheTag(oldParticipationId))
    }
    updateTag(getParticipationActivitiesCacheTag(parsed.data.participacionId))
    updateTag(ARTIST_DETAIL_CACHE_TAG)
    for (const tag of PUBLIC_ACTIVITY_TAGS) {
      try {
        updateTag(tag)
      } catch (error) {
        console.error('[updateActivityAction] Local invalidation failed', { tag, error })
      }
    }
    void revalidateWebCacheBestEffort({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    void revalidateWebCacheBestEffort({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
    if (catalogChanged) {
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
      void revalidateWebCacheBestEffort({ tag: CATALOG_PARTICIPATION_CACHE_TAG })
    }

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
