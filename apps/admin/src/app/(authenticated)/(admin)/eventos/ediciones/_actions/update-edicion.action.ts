'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import { edicionUpdateSchema } from '../_schemas/edicion.schema'
import type { ActionState } from '@/shared/types/actions'
import { EVENTO_EDICION_CACHE_TAG } from '../../_constants'
import { generateSlug } from '../../_lib/slug-utils'

const { eventEdition } = events

export async function updateEdicionAction(
  _prevState: ActionState<void>,
  formData: FormData
): Promise<ActionState<void>> {
  await requireAuth()

  const id = Number(formData.get('id'))
  if (!id || isNaN(id)) {
    return {
      success: false,
      errors: [{ entityType: 'edicion', message: 'ID inválido' }]
    }
  }

  const numeroEdicion = formData.get('numeroEdicion')
    ? Number(formData.get('numeroEdicion'))
    : undefined
  const eventoId = formData.get('eventoId')
    ? Number(formData.get('eventoId'))
    : undefined

  const rawData: {
    nombre?: string | null
    posterUrl?: string | null
    numeroEdicion?: number
    eventoId?: number
    slug?: string
  } = {
    nombre: formData.get('nombre') as string | null,
    posterUrl: formData.get('posterUrl') as string | null
  }

  if (numeroEdicion !== undefined) rawData.numeroEdicion = numeroEdicion
  if (eventoId !== undefined) rawData.eventoId = eventoId
  if (numeroEdicion !== undefined && eventoId !== undefined) {
    rawData.slug = generateSlug(`edicion-${numeroEdicion}-${eventoId}`)
  }

  const parsed = edicionUpdateSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'edicion',
        message: issue.message
      }))
    }
  }

  await db.update(eventEdition).set(parsed.data).where(eq(eventEdition.id, id))

  updateTag(EVENTO_EDICION_CACHE_TAG)

  return { success: true }
}
