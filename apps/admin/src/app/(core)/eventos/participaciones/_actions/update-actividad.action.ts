'use server'

import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { PARTICIPACIONES_CACHE_TAG } from '../_constants'
import { actividadUpdateSchema } from '../_schemas/participaciones.schema'
import { ParticipationStatus } from '../_types'

const { participationActivity } = participations

interface ActividadPatch {
  actividadId: string
  edicionId: string
  tipoActividadId?: string
  estado?: ParticipationStatus
  modoIngresoId?: string
  notas?: string | null
}

export async function updateActividadAction(
  patch: ActividadPatch
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = actividadUpdateSchema.safeParse({
      tipoActividadId: patch.tipoActividadId
        ? Number(patch.tipoActividadId)
        : undefined,
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
          entityType: 'actividad',
          message: issue.message
        }))
      }
    }

    const actividadId = Number(patch.actividadId)

    await db.transaction(async (tx) => {
      await tx
        .update(participationActivity)
        .set({
          tipoActividadId: patch.tipoActividadId
            ? Number(patch.tipoActividadId)
            : undefined,
          modoIngresoId: patch.modoIngresoId
            ? Number(patch.modoIngresoId)
            : undefined,
          estado: patch.estado,
          notas: patch.notas,
          updatedAt: new Date().toISOString()
        })
        .where(eq(participationActivity.id, actividadId))
    })

    updateTag(PARTICIPACIONES_CACHE_TAG)

    return { success: true }
  } catch (error) {
    console.error('[updateActividadAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'actividad',
          message:
            error instanceof Error
              ? error.message
              : 'Error al actualizar la actividad'
        }
      ]
    }
  }
}
