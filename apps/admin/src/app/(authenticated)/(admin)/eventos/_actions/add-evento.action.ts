'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import {
  eventoInsertSchema,
  type EventoFormInput
} from '../_schemas/evento.schema'
import type { ActionState } from '@/shared/types/actions'
import { EVENTO_CACHE_TAG } from '../_constants'
import { generateSlug } from '../_lib/slug-utils'

const { event } = events

export async function addEventoAction(
  _prevState: ActionState<{ id: number }>,
  data: EventoFormInput
): Promise<ActionState<{ id: number }>> {
  await requireAuth()

  const rawData = {
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    slug: generateSlug(data.nombre || ''),
    organizacionId: 1
  }

  const parsed = eventoInsertSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'evento',
        message: issue.message
      }))
    }
  }

  const [result] = await db
    .insert(event)
    .values(parsed.data)
    .returning({ id: event.id })

  updateTag(EVENTO_CACHE_TAG)

  return { success: true, data: { id: result.id } }
}
