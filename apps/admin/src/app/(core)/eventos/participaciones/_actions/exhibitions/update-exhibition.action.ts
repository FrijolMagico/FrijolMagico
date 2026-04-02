'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { getParticipationExhibitionsCacheTag } from '../../_constants/cache-tags'
import {
  exhibitionUpdateSchema,
  type ExhibitionUpdateInput
} from '../../_schemas/exhibition.schema'

const { participationExhibition } = participations

export async function updateExhibitionAction(
  payload: ExhibitionUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = exhibitionUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'expositor',
          message: issue.message
        }))
      }
    }

    await db
      .update(participationExhibition)
      .set(parsed.data)
      .where(eq(participationExhibition.id, parsed.data.id))

    updateTag(getParticipationExhibitionsCacheTag(parsed.data.participacionId))

    return { success: true }
  } catch (error) {
    console.error('[updateExhibitionAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'expositor',
          message:
            error instanceof Error
              ? error.message
              : 'Error al actualizar el expositor'
        }
      ]
    }
  }
}
