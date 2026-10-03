'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq, notInArray, and } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { toSlug } from '@/shared/lib/utils'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  revalidateWebCache,
  revalidateWebCacheBestEffort
} from '@/shared/lib/web-invalidation'
import {
  getActiveFestivalDisplay,
  type ActiveFestivalDisplay
} from '@frijolmagico/database/active-festival-display'
import { invalidateActiveFestivalDisplay } from '../../_lib/active-festival-invalidation'
import type { ActionState } from '@/shared/types/actions'
import {
  CATALOG_CACHE_TAG,
  CATALOG_EDITION_DATES_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EDITION_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  EDITION_DAY_CACHE_TAG
} from '@frijolmagico/cache-tags'
import {
  edicionWithDaysSchema,
  type EdicionWithDaysInput
} from '../_schemas/edition-composite.schema'

const { event, eventEdition, eventEditionDay } = events

export async function saveEditionWithDaysAction(
  _prevState: ActionState<void>,
  data: EdicionWithDaysInput
): Promise<ActionState<void>> {
  try {
    await requireAuth()

    const parsed = edicionWithDaysSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'edicion',
          message: issue.message
        }))
      }
    }

    const { id, eventoId, numeroEdicion, nombre, posterUrl, days } = parsed.data

    const [evento] = await db
      .select({ slug: event.slug })
      .from(event)
      .where(eq(event.id, eventoId))
      .limit(1)

    const slug = toSlug(`${evento?.slug ?? 'edicion'}-${numeroEdicion}`)
    let catalogDatesChanged = id === null && days.length > 0
    let catalogEditionChanged = id === null
    let publicOutputChanged = id === null
    let activeFestivalSnapshots: [ActiveFestivalDisplay | null, ActiveFestivalDisplay | null] = [null, null]

    await db.transaction(async (tx) => {
      const before = await getActiveFestivalDisplay(tx)
      let edicionId = id
      if (edicionId !== null) {
        const [existingEdition] = await tx
          .select({
            eventoId: eventEdition.eventoId,
            numeroEdicion: eventEdition.numeroEdicion,
            nombre: eventEdition.nombre,
            posterUrl: eventEdition.posterUrl,
            slug: eventEdition.slug
          })
          .from(eventEdition)
          .where(eq(eventEdition.id, edicionId))
          .limit(1)
        if (existingEdition !== undefined) {
          catalogEditionChanged =
            existingEdition.eventoId !== eventoId ||
            existingEdition.numeroEdicion !== numeroEdicion
          const editionChanged =
            existingEdition.eventoId !== eventoId ||
            existingEdition.numeroEdicion !== numeroEdicion ||
            (existingEdition.nombre ?? null) !== (nombre ?? null) ||
            (existingEdition.posterUrl ?? null) !== (posterUrl ?? null) ||
            existingEdition.slug !== slug
          publicOutputChanged = editionChanged
        }
      }
      const existingDates =
        edicionId === null
          ? []
          : await tx
              .select({
                id: eventEditionDay.id,
                fecha: eventEditionDay.fecha,
                horaInicio: eventEditionDay.horaInicio,
                horaFin: eventEditionDay.horaFin,
                modalidad: eventEditionDay.modalidad,
                lugarId: eventEditionDay.lugarId
              })
              .from(eventEditionDay)
              .where(eq(eventEditionDay.eventoEdicionId, edicionId))
      const nextDates = days.map((day) => day.fecha).sort()
      const previousDates = existingDates.map((day) => day.fecha).sort()
      catalogDatesChanged =
        catalogDatesChanged ||
        nextDates.length !== previousDates.length ||
        nextDates.some((date, index) => date !== previousDates[index])
      const existingDaysById = new Map(
        existingDates.map((day) => [day.id, day])
      )
      const nextDayIds = days
        .filter((day) => day.existingId !== undefined)
        .map((day) => day.existingId)
      const dayMembershipChanged =
        existingDates.length !== days.length ||
        existingDates.some((day) => !nextDayIds.includes(day.id)) ||
        days.some((day) => day.existingId === undefined)
      const dayFieldsChanged = days.some((day) => {
        if (day.existingId === undefined) return true
        const previous = existingDaysById.get(day.existingId)
        return (
          previous === undefined ||
          previous.fecha !== day.fecha ||
          previous.horaInicio !== day.horaInicio ||
          previous.horaFin !== day.horaFin ||
          (previous.modalidad ?? null) !== (day.modalidad ?? null) ||
          (previous.lugarId ?? null) !== (day.lugarId ?? null)
        )
      })
      publicOutputChanged =
        publicOutputChanged || dayMembershipChanged || dayFieldsChanged
      if (edicionId !== null) {
        await tx
          .update(eventEdition)
          .set({
            eventoId,
            numeroEdicion,
            nombre: nombre ?? null,
            posterUrl: posterUrl ?? null,
            slug
          })
          .where(eq(eventEdition.id, edicionId))
      } else {
        const [inserted] = await tx
          .insert(eventEdition)
          .values({
            eventoId,
            numeroEdicion,
            nombre: nombre ?? null,
            posterUrl: posterUrl ?? null,
            slug
          })
          .returning({ id: eventEdition.id })
        edicionId = inserted.id
      }

      const existingDayIds = days
        .filter((d) => d.existingId)
        .map((d) => d.existingId as number)

      if (existingDayIds.length > 0) {
        await tx
          .delete(eventEditionDay)
          .where(
            and(
              eq(eventEditionDay.eventoEdicionId, edicionId!),
              notInArray(eventEditionDay.id, existingDayIds)
            )
          )
      } else {
        await tx
          .delete(eventEditionDay)
          .where(eq(eventEditionDay.eventoEdicionId, edicionId!))
      }

      for (const day of days) {
        const dayData = {
          eventoEdicionId: edicionId!,
          fecha: day.fecha,
          horaInicio: day.horaInicio,
          horaFin: day.horaFin,
          modalidad: day.modalidad ?? undefined,
          lugarId: day.lugarId ?? undefined
        }

        if (day.existingId) {
          await tx
            .update(eventEditionDay)
            .set(dayData)
            .where(eq(eventEditionDay.id, day.existingId))
        } else {
          await tx.insert(eventEditionDay).values(dayData)
        }
      }
      activeFestivalSnapshots = [before, await getActiveFestivalDisplay(tx)]
    })

    await invalidateActiveFestivalDisplay(...activeFestivalSnapshots)
    updateTag(EDITION_CACHE_TAG)
    updateTag(EDITION_DAY_CACHE_TAG)
    for (const [tag, mode, path] of [
      [FESTIVAL_CRITICAL_CACHE_TAG, 'immediate', '/festivales/[slug]'],
      [FESTIVALES_CACHE_TAG, 'swr', '/festivales']
    ] as const) {
      try {
        await revalidateWebCache({
          tag,
          mode,
          ...(publicOutputChanged ? { path, pathType: 'page' as const } : {})
        })
      } catch {
        console.error('[save-edition] Web cache sync failed', { tag })
      }
    }
    if (catalogEditionChanged) {
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
      void revalidateWebCacheBestEffort({
        tag: CATALOG_PARTICIPATION_CACHE_TAG
      })
    }
    if (catalogDatesChanged) {
      void revalidateWebCacheBestEffort({
        tag: CATALOG_EDITION_DATES_CACHE_TAG
      })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'edicion',
          message:
            error instanceof Error ? error.message : 'Error saving edition'
        }
      ]
    }
  }
}
