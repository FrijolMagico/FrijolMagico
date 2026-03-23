'use server'

import { updateTag } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { ACTIVIDAD_CACHE_TAG } from '../_constants'
import { actividadUpdateSchema } from '../_schemas/participaciones.schema'
import { ParticipationStatus } from '../_types'

const { editionParticipation, participationActivity } = participations

const MUSICA_ACTIVITY_TYPE_ID = 3

interface ActividadPatch {
  actividadId: string
  edicionId: string
  bandaId?: string
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

    const actividadId = Number(patch.actividadId)
    const edicionId = Number(patch.edicionId)

    if (!actividadId || !edicionId) {
      return {
        success: false,
        errors: [
          { entityType: 'actividad', message: 'Faltan campos requeridos' }
        ]
      }
    }

    const actividadRecord = await db.query.participationActivity.findFirst({
      columns: {
        id: true,
        participacionId: true
      },
      where: (table, { eq: equals }) => equals(table.id, actividadId),
      with: {
        participacion: {
          columns: {
            id: true,
            edicionId: true,
            artistaId: true,
            agrupacionId: true,
            bandaId: true
          }
        }
      }
    })

    if (
      !actividadRecord ||
      !actividadRecord.participacion ||
      actividadRecord.participacion.edicionId !== edicionId
    ) {
      return {
        success: false,
        errors: [
          { entityType: 'actividad', message: 'Actividad no encontrada' }
        ]
      }
    }

    // Determine if this is a band participation
    const bandaId = patch.bandaId ? Number(patch.bandaId) : null
    const isBandParticipation = bandaId !== null || actividadRecord.participacion.bandaId !== null

    // Validate: bands can only be in music activities
    if (isBandParticipation && patch.tipoActividadId !== undefined) {
      const tipoActividadId = Number(patch.tipoActividadId)
      if (tipoActividadId !== MUSICA_ACTIVITY_TYPE_ID) {
        return {
          success: false,
          errors: [
            {
              entityType: 'actividad',
              message: 'Las bandas solo pueden participar en actividades de música'
            }
          ]
        }
      }
    }

    // Validate: if changing to banda, can't have artistaId or agrupacionId already
    if (
      bandaId !== null &&
      (actividadRecord.participacion.artistaId !== null ||
        actividadRecord.participacion.agrupacionId !== null)
    ) {
      return {
        success: false,
        errors: [
          {
            entityType: 'actividad',
            message:
              'Esta participación ya tiene artista o agrupación. Eliminar primero para asignar banda.'
          }
        ]
      }
    }

    const nextTipoActividadId = isBandParticipation
      ? MUSICA_ACTIVITY_TYPE_ID
      : patch.tipoActividadId
        ? Number(patch.tipoActividadId)
        : undefined

    const parsed = actividadUpdateSchema.safeParse({
      tipoActividadId: nextTipoActividadId,
      modoIngresoId: patch.modoIngresoId ? Number(patch.modoIngresoId) : undefined,
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

    await db.transaction(async (tx) => {
      if (bandaId !== null) {
        // Changing to banda participation
        await tx
          .update(editionParticipation)
          .set({
            bandaId: bandaId,
            artistaId: null,
            agrupacionId: null,
            updatedAt: new Date().toISOString()
          })
          .where(
            and(
              eq(editionParticipation.id, actividadRecord.participacionId),
              eq(editionParticipation.edicionId, edicionId)
            )
          )
      }
      // If already a band participation (no change to bandaId), do nothing to editionParticipation

      await tx
        .update(participationActivity)
        .set({
          tipoActividadId: nextTipoActividadId,
          modoIngresoId: patch.modoIngresoId
            ? Number(patch.modoIngresoId)
            : undefined,
          estado: patch.estado,
          notas: patch.notas,
          updatedAt: new Date().toISOString()
        })
        .where(eq(participationActivity.id, actividadId))
    })

    updateTag(ACTIVIDAD_CACHE_TAG)

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
