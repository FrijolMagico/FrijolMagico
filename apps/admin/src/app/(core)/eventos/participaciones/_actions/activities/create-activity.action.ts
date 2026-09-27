'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import {
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  getEditionParticipationsCacheTag,
  getParticipationActivitiesCacheTag
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'
import { registrationWindowToUtc } from '../../_lib/activity-registration-time'
import {
  type ActivityDetailInsertInput,
  activityDetailInsertSchema,
  type ActivityInsertInput,
  activityInsertSchema,
  parseActivityRegistrationInput
} from '../../_schemas/activity.schema'
import {
  editionParticipationInsertSchema,
  type ParticipationInsertInput
} from '../../_schemas/edition-participation.schema'

const { participationActivity, activity, activityRegistration } = participations
const PUBLIC_ACTIVITY_TAGS = [
  FESTIVALES_CACHE_TAG,
  EVENT_CACHE_TAG,
  EDITION_CACHE_TAG
]

interface CreateActivityActionInput {
  participation: ParticipationInsertInput
  activity: Omit<ActivityInsertInput, 'participacionId'>
  detail: Omit<ActivityDetailInsertInput, 'participacionActividadId'>
  registration?: unknown
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

      const isBand = parsed.data.bandaId !== null
      const effectiveType = await tx.query.activityType.findFirst({
        where: (table, { eq }) =>
          isBand
            ? eq(table.slug, 'musica')
            : eq(table.id, data.activity.tipoActividadId)
      })
      if (!effectiveType) throw new Error('El tipo de actividad no existe')

      const registration = parseActivityRegistrationInput(
        data.registration,
        effectiveType.slug
      )
      const registrationInstants = registration
        ? registrationWindowToUtc(
            registration.startDate,
            registration.startTime,
            registration.endDate,
            registration.endTime
          )
        : null

      const participationActivityValues = activityInsertSchema.parse({
        ...data.activity,
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

      await tx.insert(activity).values(activityDetailsValues)

      if (registration && registrationInstants) {
        await tx.insert(activityRegistration).values({
          participationActivityId: insertedActivity.id,
          url: registration.url,
          ...registrationInstants
        })
      }
    })

    const localTags = [
      getEditionParticipationsCacheTag(parsed.data.edicionId),
      ...(participationId === null
        ? []
        : [getParticipationActivitiesCacheTag(participationId)]),
      ...PUBLIC_ACTIVITY_TAGS
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
    for (const tag of PUBLIC_ACTIVITY_TAGS) {
      void revalidateWebCacheBestEffort({ tag })
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
