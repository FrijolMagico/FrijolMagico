'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { toSlug } from '@/shared/lib/utils'
import { requireAuth } from '@/shared/lib/auth/utils'
import { edicionInsertSchema } from '../_schemas/edicion.schema'
import type { ActionState } from '@/shared/types/actions'
import { EVENT_EDITION_CACHE_TAG } from '../../_constants'

const { eventEdition } = events

export async function addEdicionAction(
  _prevState: ActionState<{ id: number }>,
  formData: FormData
): Promise<ActionState<{ id: number }>> {
  await requireAuth()

  const numeroEdicion = Number(formData.get('numeroEdicion'))
  const eventoId = Number(formData.get('eventoId'))

  const rawData = {
    eventoId,
    numeroEdicion,
    nombre: formData.get('nombre') as string | null,
    posterUrl: formData.get('posterUrl') as string | null,
    slug: toSlug(`edicion-${numeroEdicion}-${eventoId}`)
  }

  const parsed = edicionInsertSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'edicion',
        message: issue.message
      }))
    }
  }

  const [result] = await db
    .insert(eventEdition)
    .values(parsed.data)
    .returning({ id: eventEdition.id })

  updateTag(EVENT_EDITION_CACHE_TAG)

  return { success: true, data: { id: result.id } }
}
