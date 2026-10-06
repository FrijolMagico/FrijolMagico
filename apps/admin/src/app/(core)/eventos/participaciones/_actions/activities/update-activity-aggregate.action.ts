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
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'
import { registrationWindowToUtc } from '../../_lib/activity-registration-time'
import { resolveActiveArtistPseudonym } from '../_lib/resolve-artist-pseudonym'
import {
  activityDetailInsertSchema,
  activityInsertSchema,
  activityUpdateSchema,
  parseActivityRegistrationInput,
  parseActivityOccurrencesInput,
  parseActivityPresenterDatabaseValues,
  sameActivitySchedule
} from '../../_schemas/activity.schema'
import { editionParticipationUpdateSchema } from '../../_schemas/edition-participation.schema'

const {
  activity,
  activityRegistration,
  activityOccurrence,
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
  occurrences?: unknown
  expectedOccurrences?: unknown
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
    let catalogChanged = false
    let festivalDetailChanged = false
    let festivalListChanged = false
    await db.transaction(async (tx) => {
      const existingActivity = await tx.query.participationActivity.findFirst({
        where: (table, operators) => operators.eq(table.id, activityInput.id),
        with: { tipoActividad: { columns: { slug: true } } }
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
          participation.bandaId != null
            ? operators.eq(table.slug, 'musica')
            : operators.eq(table.id, submittedTypeId)
      })
      if (!effectiveType) throw new Error('El tipo de actividad no existe')
      const publicStates = ['confirmado', 'completado']
      const oldIsPublic = publicStates.includes(existingActivity.estado ?? '')
      const newIsPublic = publicStates.includes(activityInput.estado ?? '')
      const oldTypeSlug = existingActivity.tipoActividad?.slug
      const festivalListCategory = (slug: string | undefined, isPublic: boolean) =>
        slug === 'charla'
          ? 'charla'
          : isPublic && (slug === 'taller' || slug === 'musica')
            ? slug
            : null
      festivalDetailChanged = oldIsPublic || newIsPublic
      festivalListChanged =
        festivalListCategory(oldTypeSlug, oldIsPublic) !==
        festivalListCategory(effectiveType.slug, newIsPublic)
      catalogChanged =
        (oldIsPublic || newIsPublic) &&
        (existingActivity.estado !== activityInput.estado ||
          existingActivity.tipoActividadId !== effectiveType.id ||
          existingParticipation.artistaId !== participation.artistaId ||
          existingParticipation.agrupacionId !== participation.agrupacionId)
      if (!['taller', 'charla', 'musica'].includes(effectiveType.slug)) {
        throw new Error(
          'Este tipo de actividad no admite sesiones y no se puede crear o editar hasta que el modelo lo soporte'
        )
      }
      const replacingSchedule = input.occurrences !== undefined
      if (replacingSchedule && input.expectedOccurrences === undefined) {
        throw new Error('Falta la versión original de las sesiones. Recargá la actividad e intentá de nuevo.')
      }
      if (!replacingSchedule && input.expectedOccurrences !== undefined) {
        throw new Error('No se puede verificar una sesión sin cambios solicitados')
      }
      const occurrences = replacingSchedule
        ? parseActivityOccurrencesInput(input.occurrences, effectiveType.slug)
        : null
      const expected = replacingSchedule
        ? parseActivityOccurrencesInput(input.expectedOccurrences, 'taller', false)
        : null
      const existingDetail = await tx.query.activity.findFirst({
        where: (table, operators) =>
          operators.eq(table.participacionActividadId, activityInput.id)
      })
      const current = existingDetail
        ? await tx.query.activityOccurrence.findMany({
            where: (table, operators) => operators.eq(table.activityId, existingDetail.id),
            columns: { id: true, url: true, date: true, startTime: true, durationMinutes: true }
          })
        : []
      if (!replacingSchedule && current.length === 0) {
        throw new Error('Agregá al menos una fecha para la actividad')
      }
      if (replacingSchedule && !sameActivitySchedule(current, expected ?? [])) {
        throw new Error('Las sesiones cambiaron mientras editabas. Recargá la actividad e intentá de nuevo.')
      }
      const registration = parseActivityRegistrationInput(
        input.registration,
        effectiveType.slug
      )
      const occurrenceValues = occurrences?.map((occurrence) => ({
        ...occurrence,
        startTime: occurrence.startTime || null,
        url: occurrence.url || (registration ? registration.url || null : null)
      })) ?? null
      if (registration && occurrenceValues?.some(({ url }) => !url)) {
        throw new Error('Cada sesión debe tener una URL de inscripción')
      }
      const instants = registration
        ? registrationWindowToUtc(
            registration.startDate,
            registration.startTime,
            registration.endDate,
            registration.endTime
          )
        : null
      const pseudonimoId = participation.artistaId
        ? await resolveActiveArtistPseudonym(
            tx,
            participation.artistaId,
            activityInput.pseudonimoId,
            existingActivity.pseudonimoId
          )
        : null
      const activityValues = activityInsertSchema.parse({
        ...activityInput,
        artistaId: participation.artistaId ?? null,
        pseudonimoId,
        tipoActividadId: effectiveType.id,
        participacionId: participation.id
      })
      if (typeof input.detail !== 'object' || input.detail === null) {
        throw new Error('Los detalles de actividad no son válidos')
      }
      const detailPayload = input.detail as Record<string, unknown>
      const presenterValues = parseActivityPresenterDatabaseValues(
        detailPayload,
        effectiveType.slug === 'charla'
      )
      const detailValues = activityDetailInsertSchema.parse({
        ...detailPayload,
        ...presenterValues,
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
          notas: activityValues.notas,
          artistaId: activityValues.artistaId,
          pseudonimoId: activityValues.pseudonimoId
        })
        .where(eq(participationActivity.id, activityInput.id))
      await tx.insert(activity).values(detailValues).onConflictDoUpdate({
        target: activity.participacionActividadId,
        set: detailValues
      })
      if (occurrenceValues !== null) {
        if (!existingDetail) throw new Error('No se encontraron los detalles de la actividad')
        const key = (occurrence: { date: string; startTime?: string | null; durationMinutes?: number | null }) =>
          JSON.stringify([occurrence.date, occurrence.startTime ?? null, occurrence.durationMinutes ?? null])
        const remaining = [...current]
        const retained: { stored: (typeof current)[number]; desired: (typeof occurrenceValues)[number] }[] = []
        const added: (typeof occurrenceValues)[number][] = []
        for (const occurrence of occurrenceValues) {
          const matchIndex = occurrence.id === undefined
            ? remaining.findIndex((stored) => key(stored) === key(occurrence))
            : remaining.findIndex((stored) => stored.id === occurrence.id)
          if (matchIndex >= 0) {
            const [stored] = remaining.splice(matchIndex, 1)
            retained.push({ stored: stored!, desired: occurrence })
          } else if (occurrence.id !== undefined) {
            throw new Error('Una sesión ya no existe. Recargá la actividad e intentá de nuevo.')
          } else {
            added.push(occurrence)
          }
        }
        for (const removed of remaining) {
          await tx.delete(activityOccurrence).where(eq(activityOccurrence.id, removed.id))
        }
        for (const { stored, desired } of retained) {
          if (
            stored.date !== desired.date ||
            stored.startTime !== (desired.startTime ?? null) ||
            stored.durationMinutes !== (desired.durationMinutes ?? null) ||
            stored.url !== desired.url
          ) {
            await tx.update(activityOccurrence)
              .set({
                date: desired.date,
                startTime: desired.startTime ?? null,
                durationMinutes: desired.durationMinutes ?? null,
                url: desired.url
              })
              .where(eq(activityOccurrence.id, stored.id))
          }
        }
        for (const occurrence of added) {
          await tx.insert(activityOccurrence).values({
            activityId: existingDetail.id,
            date: occurrence.date,
            startTime: occurrence.startTime ?? null,
            durationMinutes: occurrence.durationMinutes ?? null,
            ...(occurrence.url ? { url: occurrence.url } : {})
          })
        }
      }
      if (registration && instants) {
        const registrationUrl =
          occurrenceValues?.[0]?.url ||
          registration.url ||
          current.find(({ url }) => url)?.url
        if (!registrationUrl) {
          throw new Error('Cada sesión debe tener una URL de inscripción')
        }
        await tx
          .insert(activityRegistration)
          .values({
            participationActivityId: activityInput.id,
            url: registrationUrl,
            ...instants
          })
          .onConflictDoUpdate({
            target: activityRegistration.participationActivityId,
            set: {
              url: registrationUrl,
              ...instants
            }
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
      ...PUBLIC_TAGS,
      ARTIST_DETAIL_CACHE_TAG
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
    const webRevalidation = await revalidateWebCacheBatch(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate',
          ...(festivalDetailChanged
            ? { path: '/festivales/[slug]', pathType: 'page' as const }
            : {})
        },
        {
          tag: FESTIVALES_CACHE_TAG,
          mode: 'swr',
          ...(festivalListChanged
            ? { path: '/festivales', pathType: 'page' as const }
            : {})
        },
        ...(catalogChanged
          ? [
              { tag: CATALOG_CACHE_TAG },
              { tag: CATALOG_PARTICIPATION_CACHE_TAG }
            ]
          : [])
      ],
      'update-activity-aggregate'
    )
    return { success: true, ...webRevalidation }
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
