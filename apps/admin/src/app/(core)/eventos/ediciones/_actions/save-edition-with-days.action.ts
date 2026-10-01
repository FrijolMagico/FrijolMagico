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

    await db.transaction(async (tx) => {
      let edicionId = id
      if (edicionId !== null) {
        const [existingEdition] = await tx
          .select({
            eventoId: eventEdition.eventoId,
            numeroEdicion: eventEdition.numeroEdicion
          })
          .from(eventEdition)
          .where(eq(eventEdition.id, edicionId))
          .limit(1)
        catalogEditionChanged =
          existingEdition !== undefined &&
          (existingEdition.eventoId !== eventoId ||
            existingEdition.numeroEdicion !== numeroEdicion)
      }
      const existingDates =
        edicionId === null
          ? []
          : await tx
              .select({ fecha: eventEditionDay.fecha })
              .from(eventEditionDay)
              .where(eq(eventEditionDay.eventoEdicionId, edicionId))
      const nextDates = days.map((day) => day.fecha).sort()
      const previousDates = existingDates.map((day) => day.fecha).sort()
      catalogDatesChanged =
        catalogDatesChanged ||
        nextDates.length !== previousDates.length ||
        nextDates.some((date, index) => date !== previousDates[index])

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
    })

    updateTag(EDITION_CACHE_TAG)
    updateTag(EDITION_DAY_CACHE_TAG)
    for (const [tag, mode] of [
      [FESTIVAL_CRITICAL_CACHE_TAG, 'immediate'],
      [FESTIVALES_CACHE_TAG, 'swr']
    ] as const) {
      try {
        await revalidateWebCache({ tag, mode })
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
