'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import {
  editionParticipationUpdateSchema,
  type ParticipationUpdateInput
} from '../../_schemas/edition-participation.schema'
import { getEditionParticipationsCacheTag } from '../../_constants/cache-tags'

const { editionParticipation } = participations

export async function updateParticipationAction(
  payload: ParticipationUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = editionParticipationUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'detalles',
          message: issue.message
        }))
      }
    }

    await db
      .update(editionParticipation)
      .set(parsed.data)
      .where(eq(editionParticipation.id, parsed.data.id))

    updateTag(getEditionParticipationsCacheTag(parsed.data.edicionId))

    return { success: true }
  } catch (error) {
    console.error('[updateDetallesAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'detalles',
          message:
            error instanceof Error
              ? error.message
              : 'Error al actualizar los detalles'
        }
      ]
    }
  }
}
