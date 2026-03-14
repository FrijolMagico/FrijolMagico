'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { EVENTO_EDICION_CACHE_TAG } from '../../_constants'

const { eventEdition } = events

export async function deleteEdicionAction(
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

  await db.delete(eventEdition).where(eq(eventEdition.id, id))

  updateTag(EVENTO_EDICION_CACHE_TAG)

  return { success: true }
}
