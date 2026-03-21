'use server'

import 'server-only'
import { z } from 'zod'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { lugarInsertSchema } from '../_schemas/place.schema'
import type { ActionState } from '@/shared/types/actions'
import { PLACE_CACHE_TAG } from '../_constants'

const { place } = core

export async function createPlaceAction(
  _prevState: ActionState<{ id: number }>,
  data: z.infer<typeof lugarInsertSchema>
): Promise<ActionState<{ id: number }>> {
  await requireAuth()

  const parsed = lugarInsertSchema.safeParse(data)

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

  updateTag(PLACE_CACHE_TAG)

  return { success: true, data: { id: result.id } }
}
