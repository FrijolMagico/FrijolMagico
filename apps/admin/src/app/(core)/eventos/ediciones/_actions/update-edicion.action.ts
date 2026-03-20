'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { toSlug } from '@/shared/lib/utils'
import { requireAuth } from '@/shared/lib/auth/utils'
import { edicionUpdateSchema } from '../_schemas/edicion.schema'
import type { ActionState } from '@/shared/types/actions'
import { EDITION_CACHE_TAG } from '../_constants'

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
    id: number
    nombre?: string | null
    posterUrl?: string | null
    numeroEdicion?: number
    eventoId?: number
    slug?: string
  } = {
    id,
    nombre: formData.get('nombre') as string | null,
    posterUrl: formData.get('posterUrl') as string | null
  }

  if (numeroEdicion !== undefined) rawData.numeroEdicion = numeroEdicion
  if (eventoId !== undefined) rawData.eventoId = eventoId
  if (numeroEdicion !== undefined && eventoId !== undefined) {
    rawData.slug = toSlug(`edicion-${numeroEdicion}-${eventoId}`)
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

  const { id: _id, ...editionData } = parsed.data

  await db.update(eventEdition).set(editionData).where(eq(eventEdition.id, id))

  updateTag(EDITION_CACHE_TAG)

  return { success: true }
}
