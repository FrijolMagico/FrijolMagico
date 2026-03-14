'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import {
  eventoUpdateSchema,
  type EventoUpdateFormInput
} from '../_schemas/evento.schema'
import type { ActionState } from '@/shared/types/actions'
import { EVENTO_CACHE_TAG } from '../_constants'
import { generateSlug } from '../_lib/slug-utils'

const { event } = events

export async function updateEventoAction(
  _prevState: ActionState<void>,
  data: EventoUpdateFormInput
): Promise<ActionState<void>> {
  await requireAuth()

  if (!data.id) {
    return {
      success: false,
      errors: [{ entityType: 'evento', message: 'ID de evento inválido' }]
    }
  }

  const rawData = {
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    slug: data.nombre ? generateSlug(data.nombre) : undefined
  }

  const parsed = eventoUpdateSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'evento',
        message: issue.message
      }))
    }
  }

  await db.update(event).set(parsed.data).where(eq(event.id, data.id))

  updateTag(EVENTO_CACHE_TAG)

  return { success: true }
}
