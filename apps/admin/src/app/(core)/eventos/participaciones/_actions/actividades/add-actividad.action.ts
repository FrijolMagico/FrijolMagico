'use server'

import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { PARTICIPACIONES_CACHE_TAG } from '../../_constants'
import { ParticipationStatus, isParticipationStatus } from '../../_types'

const { editionParticipation, participationActivity, activity } = participations

function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  return typeof value === 'string' ? value : null
}

export async function addActividadAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth()

    const edicionId = Number(formData.get('eventoEdicionId'))
    const artistaId = formData.get('artistaId')
      ? Number(formData.get('artistaId'))
      : null
    const agrupacionId = formData.get('agrupacionId')
      ? Number(formData.get('agrupacionId'))
      : null

    // Participacion Actividad Details
    const tipoActividadId = Number(formData.get('tipoActividadId'))
    const modoIngresoId = Number(formData.get('modoIngresoId')) || 2
    const rawEstado = getFormString(formData, 'estado')
    const estado: ParticipationStatus =
      rawEstado !== null && isParticipationStatus(rawEstado)
        ? rawEstado
        : 'seleccionado'
    const notas = getFormString(formData, 'notas')

    // Activity Details (the actual schedule info)
    const titulo = getFormString(formData, 'titulo')
    const descripcion = getFormString(formData, 'descripcion')
    const duracionMinutos = formData.get('duracionMinutos')
      ? Number(formData.get('duracionMinutos'))
      : null
    const ubicacion = getFormString(formData, 'ubicacion')
    const horaInicio = getFormString(formData, 'horaInicio')
    const cupos = formData.get('cupos') ? Number(formData.get('cupos')) : null

    if (!edicionId || !tipoActividadId || (!artistaId && !agrupacionId)) {
      return {
        success: false,
        errors: [
          { entityType: 'participacion', message: 'Faltan campos requeridos' }
        ]
      }
    }

    await db.transaction(async (tx) => {
      // 1. Find or create the master participation record
      let participationRecord = null

      if (artistaId) {
        const existing = await tx.query.editionParticipation.findFirst({
          where: (t, { eq, and }) =>
            and(eq(t.edicionId, edicionId), eq(t.artistaId, artistaId))
        })
        participationRecord = existing
      } else if (agrupacionId) {
        const existing = await tx.query.editionParticipation.findFirst({
          where: (t, { eq, and }) =>
            and(eq(t.edicionId, edicionId), eq(t.agrupacionId, agrupacionId))
        })
        participationRecord = existing
      }

      let participacionId: number

      if (!participationRecord) {
        const [inserted] = await tx
          .insert(editionParticipation)
          .values({
            edicionId,
            artistaId: artistaId || undefined,
            agrupacionId: agrupacionId || undefined
          })
          .returning({ id: editionParticipation.id })
        participacionId = inserted.id
      } else {
        participacionId = participationRecord.id
      }

      // 2. Insert the participant activity record
      const [insertedActivity] = await tx
        .insert(participationActivity)
        .values({
          participacionId,
          tipoActividadId,
          modoIngresoId,
          estado,
          notas
        })
        .returning({ id: participationActivity.id })

      // 3. Insert the concrete schedule activity details
      await tx.insert(activity).values({
        participacionActividadId: insertedActivity.id,
        titulo: titulo || null,
        descripcion: descripcion || null,
        duracionMinutos: duracionMinutos || null,
        ubicacion: ubicacion || null,
        horaInicio: horaInicio || null,
        cupos: cupos || null
      })
    })

    updateTag(PARTICIPACIONES_CACHE_TAG)

    return { success: true }
  } catch (error) {
    console.error('[addActividadAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'participacion',
          message:
            error instanceof Error
              ? error.message
              : 'Error al guardar la actividad'
        }
      ]
    }
  }
}
