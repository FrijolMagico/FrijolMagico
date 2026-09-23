'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  getEditionParticipationsCacheTag,
  getParticipationActivitiesCacheTag
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
import { registrationWindowToUtc } from '../../_lib/activity-registration-time'
import {
  activityDetailInsertSchema,
  activityInsertSchema,
  activityUpdateSchema,
  parseActivityRegistrationInput
} from '../../_schemas/activity.schema'
import { editionParticipationUpdateSchema } from '../../_schemas/edition-participation.schema'

const {
  activity,
  activityRegistration,
  editionParticipation,
  participationActivity
} = participations
const PUBLIC_TAGS = [FESTIVALES_CACHE_TAG, EVENT_CACHE_TAG, EDITION_CACHE_TAG]

interface UpdateActivityAggregateInput {
  editionId: number
  participation: unknown
  activity: unknown
  detail: unknown
  registration?: unknown
}

export async function updateActivityAggregateAction(
  input: UpdateActivityAggregateInput
): Promise<ActionState> {
  try {
    await requireAuth()
    const participation = editionParticipationUpdateSchema.parse(
      input.participation
    )
    const activityInput = activityUpdateSchema.parse(input.activity)
    if (
      participation.edicionId !== input.editionId ||
      activityInput.participacionId !== participation.id
    ) {
      throw new Error('La actividad no pertenece a esta edición')
    }

    let effectiveParticipationId: number | null = null
    await db.transaction(async (tx) => {
      const existingActivity = await tx.query.participationActivity.findFirst({
        where: (table, operators) => operators.eq(table.id, activityInput.id)
      })
      if (
        !existingActivity ||
        existingActivity.participacionId !== participation.id
      ) {
        throw new Error('La actividad no pertenece a esta participación')
      }
      const existingParticipation =
        await tx.query.editionParticipation.findFirst({
          where: (table, operators) => operators.eq(table.id, participation.id)
        })
      if (
        !existingParticipation ||
        existingParticipation.edicionId !== input.editionId
      ) {
        throw new Error('La participación no pertenece a esta edición')
      }

      const submittedTypeId =
        activityInput.tipoActividadId ?? existingActivity.tipoActividadId
      const effectiveType = await tx.query.activityType.findFirst({
        where: (table, operators) =>
          participation.bandaId !== null
            ? operators.eq(table.slug, 'musica')
            : operators.eq(table.id, submittedTypeId)
      })
      if (!effectiveType) throw new Error('El tipo de actividad no existe')
      const registration = parseActivityRegistrationInput(
        input.registration,
        effectiveType.slug
      )
      const instants = registration
        ? registrationWindowToUtc(
            registration.startDate,
            registration.startTime,
            registration.endDate,
            registration.endTime
          )
        : null
      const activityValues = activityInsertSchema.parse({
        ...activityInput,
        tipoActividadId: effectiveType.id,
        participacionId: participation.id
      })
      if (typeof input.detail !== 'object' || input.detail === null) {
        throw new Error('Los detalles de actividad no son válidos')
      }
      const detailValues = activityDetailInsertSchema.parse({
        ...(input.detail as Record<string, unknown>),
        participacionActividadId: activityInput.id
      })
      effectiveParticipationId = participation.id

      await tx
        .update(editionParticipation)
        .set({
          artistaId: participation.artistaId,
          bandaId: participation.bandaId,
          agrupacionId: participation.agrupacionId
        })
        .where(eq(editionParticipation.id, participation.id))
      await tx
        .update(participationActivity)
        .set({
          tipoActividadId: activityValues.tipoActividadId,
          modoIngresoId: activityValues.modoIngresoId,
          estado: activityValues.estado,
          puntaje: activityValues.puntaje,
          notas: activityValues.notas
        })
        .where(eq(participationActivity.id, activityInput.id))
      await tx.insert(activity).values(detailValues).onConflictDoUpdate({
        target: activity.participacionActividadId,
        set: detailValues
      })
      if (registration && instants) {
        await tx
          .insert(activityRegistration)
          .values({
            participationActivityId: activityInput.id,
            url: registration.url,
            ...instants
          })
          .onConflictDoUpdate({
            target: activityRegistration.participationActivityId,
            set: { url: registration.url, ...instants }
          })
      } else {
        // Keep explicit domain cleanup in addition to the database music trigger.
        await tx
          .delete(activityRegistration)
          .where(
            eq(activityRegistration.participationActivityId, activityInput.id)
          )
      }
    })

    const tags = [
      getEditionParticipationsCacheTag(input.editionId),
      ...(effectiveParticipationId === null
        ? []
        : [getParticipationActivitiesCacheTag(effectiveParticipationId)]),
      ...PUBLIC_TAGS
    ]
    for (const tag of tags) {
      try {
        updateTag(tag)
      } catch (error) {
        console.error(
          '[updateActivityAggregateAction] Local invalidation failed',
          { tag, error }
        )
      }
    }
    for (const tag of PUBLIC_TAGS) void revalidateWebCacheBestEffort({ tag })
    return { success: true }
  } catch (error) {
    console.error('[updateActivityAggregateAction]', error)
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
