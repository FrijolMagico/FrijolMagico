'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import {
  getEditionParticipationsCacheTag,
  getParticipationExhibitionsCacheTag
} from '../../_constants/cache-tags'
import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'
import {
  type ExhibitionInsertInput,
  exhibitionInsertSchema
} from '../../_schemas/exhibition.schema'
import {
  editionParticipationInsertSchema,
  ParticipationInsertInput
} from '../../_schemas/edition-participation.schema'

const { participationExhibition } = participations

export async function createExhibitionAction(data: {
  participation: ParticipationInsertInput
  exhibition: Omit<ExhibitionInsertInput, 'participacionId'>
}): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = editionParticipationInsertSchema.safeParse(
      data.participation
    )

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'participacion',
          message: issue.message
        }))
      }
    }

    let participationId: number | null = null

    await db.transaction(async (tx) => {
      const participationRecord = await findOrCreateEditionParticipation(
        tx,
        parsed.data
      )

      participationId = participationRecord.id

      if (!participationId) {
        throw new Error('Error al crear o encontrar la participación')
      }

      const exhibitionValues = exhibitionInsertSchema.parse({
        ...data.exhibition,
        participacionId: participationRecord.id
      })

      await tx.insert(participationExhibition).values(exhibitionValues)
    })

    updateTag(getEditionParticipationsCacheTag(data.participation.edicionId))
    if (participationId !== null) {
      updateTag(getParticipationExhibitionsCacheTag(participationId))
    }

    return { success: true }
  } catch (error) {
    console.error('[createExhibitionAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'participacion',
          message:
            error instanceof Error
              ? error.message
              : 'Error al guardar el expositor'
        }
      ]
    }
  }
}
