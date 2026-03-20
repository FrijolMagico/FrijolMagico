'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { EDITION_DAY_CACHE_TAG } from '../_constants'

const { eventEditionDay } = events

export async function deleteEdicionDiaAction(
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

  await db.delete(eventEditionDay).where(eq(eventEditionDay.id, id))

  updateTag(EDITION_DAY_CACHE_TAG)

  return { success: true }
}
