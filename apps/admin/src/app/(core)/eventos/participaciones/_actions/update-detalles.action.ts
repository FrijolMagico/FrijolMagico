'use server'

import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { PARTICIPACIONES_CACHE_TAG } from '../_constants'
import { actividadDetallesUpdateSchema } from '../_schemas/participaciones.schema'

const { activity } = participations

interface DetallesPatch {
  detallesId: string
  titulo?: string | null
  descripcion?: string | null
  duracionMinutos?: number | null
  cupos?: number | null
  horaInicio?: string | null
  ubicacion?: string | null
}

export async function updateDetallesAction(
  patch: DetallesPatch
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = actividadDetallesUpdateSchema.safeParse({
      titulo: patch.titulo,
      descripcion: patch.descripcion,
      duracionMinutos: patch.duracionMinutos,
      cupos: patch.cupos,
      horaInicio: patch.horaInicio,
      ubicacion: patch.ubicacion
    })

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'detalles',
          message: issue.message
        }))
      }
    }

    const detallesId = Number(patch.detallesId)

    await db.transaction(async (tx) => {
      await tx
        .update(activity)
        .set({
          titulo: patch.titulo,
          descripcion: patch.descripcion,
          duracionMinutos: patch.duracionMinutos,
          cupos: patch.cupos,
          horaInicio: patch.horaInicio,
          ubicacion: patch.ubicacion,
          updatedAt: new Date().toISOString()
        })
        .where(eq(activity.id, detallesId))
    })

    updateTag(PARTICIPACIONES_CACHE_TAG)

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
