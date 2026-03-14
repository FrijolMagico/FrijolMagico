'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import { edicionDiaInsertSchema } from '../_schemas/edicion.schema'
import type { ActionState } from '@/shared/types/actions'
import { EVENTO_EDICION_CACHE_TAG } from '../../_constants'

const { eventEditionDay } = events

export async function addEdicionDiaAction(
  _prevState: ActionState<{ id: number }>,
  formData: FormData
): Promise<ActionState<{ id: number }>> {
  await requireAuth()

  const rawData = {
    eventoEdicionId: Number(formData.get('eventoEdicionId')),
    lugarId: formData.get('lugarId')
      ? Number(formData.get('lugarId'))
      : undefined,
    fecha: formData.get('fecha') as string,
    horaInicio: formData.get('horaInicio') as string,
    horaFin: formData.get('horaFin') as string
  }

  const parsed = edicionDiaInsertSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'edicion-dia',
        message: issue.message
      }))
    }
  }

  const [result] = await db
    .insert(eventEditionDay)
    .values(parsed.data)
    .returning({ id: eventEditionDay.id })

  updateTag(EVENTO_EDICION_CACHE_TAG)

  return { success: true, data: { id: result.id } }
}
