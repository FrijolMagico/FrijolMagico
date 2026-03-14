'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import { lugarInsertSchema } from '../_schemas/edicion.schema'
import type { ActionState } from '@/shared/types/actions'
import { LUGAR_CACHE_TAG } from '../../_constants'

const { place } = core

export async function addLugarAction(
  _prevState: ActionState<{ id: number }>,
  formData: FormData
): Promise<ActionState<{ id: number }>> {
  await requireAuth()

  const rawData = {
    nombre: formData.get('nombre') as string,
    direccion: formData.get('direccion') as string | null,
    ciudad: formData.get('ciudad') as string | null,
    url: formData.get('url') as string | null
  }

  const parsed = lugarInsertSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'lugar',
        message: issue.message
      }))
    }
  }

  const [result] = await db
    .insert(place)
    .values(parsed.data)
    .returning({ id: place.id })

  updateTag(LUGAR_CACHE_TAG)

  return { success: true, data: { id: result.id } }
}
