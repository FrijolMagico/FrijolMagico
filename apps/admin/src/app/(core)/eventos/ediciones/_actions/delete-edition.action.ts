'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import {
  EDITION_CACHE_TAG,
  EDITION_DAY_CACHE_TAG
} from '@frijolmagico/cache-tags'

const { eventEdition } = events

export async function deleteEditionAction(
  _prevState: ActionState<void>,
  payload: { id: number }
): Promise<ActionState<void>> {
  await requireAuth()

  const id = payload.id
  if (!id || isNaN(id)) {
    return {
      success: false,
      errors: [{ entityType: 'edicion', message: 'ID inválido' }]
    }
  }

  await db.delete(eventEdition).where(eq(eventEdition.id, id))

  updateTag(EDITION_CACHE_TAG)
  updateTag(EDITION_DAY_CACHE_TAG)
  try {
    await revalidateWebCache({ tag: EDITION_CACHE_TAG })
  } catch {
    console.error('[delete-edition] Web cache sync failed', {
      tag: EDITION_CACHE_TAG
    })
  }

  return { success: true }
}
