'use server'

import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { EXPOSICION_CACHE_TAG } from '../_constants'
import { expositorUpdateSchema } from '../_schemas/participaciones.schema'
import { ParticipationStatus } from '../_types'

const { participationExhibition } = participations

interface ExpositorPatch {
  expositorId: string
  edicionId: string
  disciplinaId?: string
  estado?: ParticipationStatus
  modoIngresoId?: string
  notas?: string | null
}

export async function updateExpositorAction(
  patch: ExpositorPatch
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = expositorUpdateSchema.safeParse({
      disciplinaId: patch.disciplinaId ? Number(patch.disciplinaId) : undefined,
      modoIngresoId: patch.modoIngresoId
        ? Number(patch.modoIngresoId)
        : undefined,
      estado: patch.estado,
      notas: patch.notas
    })

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'expositor',
          message: issue.message
        }))
      }
    }

    const expositorId = Number(patch.expositorId)

    await db.transaction(async (tx) => {
      await tx
        .update(participationExhibition)
        .set({
          disciplinaId: patch.disciplinaId
            ? Number(patch.disciplinaId)
            : undefined,
          modoIngresoId: patch.modoIngresoId
            ? Number(patch.modoIngresoId)
            : undefined,
          estado: patch.estado,
          notas: patch.notas,
          updatedAt: new Date().toISOString()
        })
        .where(eq(participationExhibition.id, expositorId))
    })

    updateTag(EXPOSICION_CACHE_TAG)

    return { success: true }
  } catch (error) {
    console.error('[updateExpositorAction]', error)
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
