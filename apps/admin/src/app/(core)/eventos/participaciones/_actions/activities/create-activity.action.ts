'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
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
import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'
import { resolveActiveArtistPseudonym } from '../_lib/resolve-artist-pseudonym'
import { registrationWindowToUtc } from '../../_lib/activity-registration-time'
import {
  type ActivityDetailInsertInput,
  activityDetailInsertSchema,
  type ActivityInsertInput,
  activityInsertSchema,
  parseActivityRegistrationInput,
  parseActivityOccurrencesInput
} from '../../_schemas/activity.schema'
import {
  editionParticipationInsertSchema,
  type ParticipationInsertInput
} from '../../_schemas/edition-participation.schema'

const { participationActivity, activity, activityRegistration, activityOccurrence } = participations
const PUBLIC_ACTIVITY_TAGS = [
  FESTIVALES_CACHE_TAG,
  EVENT_CACHE_TAG,
  EDITION_CACHE_TAG
]

interface CreateActivityActionInput {
  participation: ParticipationInsertInput
  activity: Omit<ActivityInsertInput, 'participacionId'>
  pseudonimoId?: number | null
  detail: Omit<ActivityDetailInsertInput, 'participacionActividadId'>
  registration?: unknown
  occurrences?: unknown
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
    const isPublicActivity =
      data.activity.estado === 'confirmado' || data.activity.estado === 'completado'

    await db.transaction(async (tx) => {
      const participationRecord = await findOrCreateEditionParticipation(
        tx,
        parsed.data
      )

      participationId = participationRecord.id

      if (!participationId) {
        throw new Error('Error al crear o encontrar la participación')
      }

      const isBand = parsed.data.bandaId != null
      const effectiveType = await tx.query.activityType.findFirst({
        where: (table, { eq }) =>
          isBand
            ? eq(table.slug, 'musica')
            : eq(table.id, data.activity.tipoActividadId)
      })
      if (!effectiveType) throw new Error('El tipo de actividad no existe')

      if (!['taller', 'charla', 'musica'].includes(effectiveType.slug)) {
        throw new Error(
          'Este tipo de actividad no admite sesiones y no se puede crear o editar hasta que el modelo lo soporte'
        )
      }
      const occurrences = parseActivityOccurrencesInput(
        data.occurrences,
        effectiveType.slug
      )
      const registration = parseActivityRegistrationInput(
        data.registration,
        effectiveType.slug
      )
      const occurrenceValues = occurrences.map((occurrence) => ({
        date: occurrence.date,
        startTime: occurrence.startTime || null,
        durationMinutes: occurrence.durationMinutes ?? null,
        url: registration ? occurrence.url || registration.url || null : null
      }))
      if (registration && occurrenceValues.some(({ url }) => !url)) {
        throw new Error('Cada sesión debe tener una URL de inscripción')
      }
      const registrationInstants = registration
        ? registrationWindowToUtc(
            registration.startDate,
            registration.startTime,
            registration.endDate,
            registration.endTime
          )
        : null

      const pseudonimoId = parsed.data.artistaId
        ? await resolveActiveArtistPseudonym(
            tx,
            parsed.data.artistaId,
            data.pseudonimoId
          )
        : null
      const participationActivityValues = activityInsertSchema.parse({
        ...data.activity,
        artistaId: parsed.data.artistaId ?? null,
        pseudonimoId,
        tipoActividadId: effectiveType.id,
        participacionId: participationRecord.id
      })

      const [insertedActivity] = await tx
        .insert(participationActivity)
        .values(participationActivityValues)
        .returning({ id: participationActivity.id })

      const activityDetailsValues = activityDetailInsertSchema.parse({
        participacionActividadId: insertedActivity.id,
        ...data.detail
      })

      const [insertedDetail] = await tx.insert(activity)
        .values(activityDetailsValues)
        .returning({ id: activity.id })

      if (occurrenceValues.length) {
        await tx.insert(activityOccurrence).values(
          occurrenceValues.map(({ url, ...occurrence }) => ({
            activityId: insertedDetail.id,
            ...occurrence,
            ...(url ? { url } : {})
          }))
        )
      }

      if (registration && registrationInstants) {
        await tx.insert(activityRegistration).values({
          participationActivityId: insertedActivity.id,
          // Retained for compatibility with legacy readers; occurrence URLs are authoritative.
          url: occurrenceValues[0]!.url!,
          ...registrationInstants
        })
      }
    })

    const localTags = [
      getEditionParticipationsCacheTag(parsed.data.edicionId),
      ...(participationId === null
        ? []
        : [getParticipationActivitiesCacheTag(participationId)]),
      ...PUBLIC_ACTIVITY_TAGS,
      ARTIST_DETAIL_CACHE_TAG
    ]
    for (const tag of localTags) {
      try {
        updateTag(tag)
      } catch (error) {
        console.error(
          '[createActivityAction] Local cache invalidation failed',
          {
            tag,
            error
          }
        )
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
    if (isPublicActivity) {
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
      void revalidateWebCacheBestEffort({ tag: CATALOG_PARTICIPATION_CACHE_TAG })
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
