'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq, notInArray, and } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { toSlug } from '@/shared/lib/utils'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { EDITION_CACHE_TAG, EDITION_DAY_CACHE_TAG } from '../_constants'
import {
  edicionWithDaysSchema,
  type EdicionWithDaysInput
} from '../_schemas/edition-composite.schema'

const { eventEdition, eventEditionDay } = events

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

    const slug = toSlug(`edicion-${numeroEdicion}-${eventoId}`)

    await db.transaction(async (tx) => {
      let edicionId = id

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
