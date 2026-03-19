'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { edicionDiaUpdateSchema } from '../_schemas/edicion.schema'
import type { ActionState } from '@/shared/types/actions'
import { EVENT_EDITION_CACHE_TAG } from '../../_constants'

const { eventEditionDay } = events

export async function updateEdicionDiaAction(
  _prevState: ActionState<void>,
  formData: FormData
): Promise<ActionState<void>> {
  await requireAuth()

  const id = Number(formData.get('id'))
  if (!id || isNaN(id)) {
    return {
      success: false,
      errors: [{ entityType: 'edicion-dia', message: 'ID inválido' }]
    }
  }

  const rawData: {
    fecha?: string
    horaInicio?: string
    horaFin?: string
    lugarId?: number
  } = {
    fecha: formData.get('fecha') as string | undefined,
    horaInicio: formData.get('horaInicio') as string | undefined,
    horaFin: formData.get('horaFin') as string | undefined
  }

  const lugarId = formData.get('lugarId')
  if (lugarId) {
    rawData.lugarId = Number(lugarId)
  }

  const parsed = edicionDiaUpdateSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'edicion-dia',
        message: issue.message
      }))
    }
  }

  await db
    .update(eventEditionDay)
    .set(parsed.data)
    .where(eq(eventEditionDay.id, id))

  updateTag(EVENT_EDITION_CACHE_TAG)

  return { success: true }
}
