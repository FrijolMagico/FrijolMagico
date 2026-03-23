'use server'

import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { ACTIVIDAD_CACHE_TAG } from '../../_constants'
import { ParticipationStatus, isParticipationStatus } from '../../_types'

const { editionParticipation, participationActivity, activity } = participations

const MUSICA_ACTIVITY_TYPE_ID = 3

function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  return typeof value === 'string' ? value : null
}

function toOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getParticipantSelection(params: {
  artistaId: number | null
  agrupacionId: number | null
  bandaId: number | null
}) {
  const selectedCount = [
    params.artistaId,
    params.agrupacionId,
    params.bandaId
  ].filter((value) => value !== null).length

  return {
    hasSingleSelection: selectedCount === 1,
    isBandSelection: params.bandaId !== null
  }
}

export async function addActividadAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth()

    const edicionId = Number(formData.get('eventoEdicionId'))
    const artistaId = toOptionalNumber(formData.get('artistaId'))
    const agrupacionId = toOptionalNumber(formData.get('agrupacionId'))
    const bandaId = toOptionalNumber(formData.get('bandaId'))
    const participantSelection = getParticipantSelection({
      artistaId,
      agrupacionId,
      bandaId
    })

    const requestedTipoActividadId = Number(formData.get('tipoActividadId'))
    const tipoActividadId = participantSelection.isBandSelection
      ? MUSICA_ACTIVITY_TYPE_ID
      : requestedTipoActividadId
    const modoIngresoId = Number(formData.get('modoIngresoId')) || 2
    const rawEstado = getFormString(formData, 'estado')
    const estado: ParticipationStatus =
      rawEstado !== null && isParticipationStatus(rawEstado)
        ? rawEstado
        : 'seleccionado'
    const notas = getFormString(formData, 'notas')

    const titulo = getFormString(formData, 'titulo')
    const descripcion = getFormString(formData, 'descripcion')
    const duracionMinutos = toOptionalNumber(formData.get('duracionMinutos'))
    const ubicacion = getFormString(formData, 'ubicacion')
    const horaInicio = getFormString(formData, 'horaInicio')
    const cupos = toOptionalNumber(formData.get('cupos'))

    if (
      !edicionId ||
      !tipoActividadId ||
      !participantSelection.hasSingleSelection
    ) {
      return {
        success: false,
        errors: [
          { entityType: 'participacion', message: 'Faltan campos requeridos' }
        ]
      }
    }

    if (
      bandaId !== null &&
      (artistaId !== null ||
        agrupacionId !== null ||
        tipoActividadId !== MUSICA_ACTIVITY_TYPE_ID)
    ) {
      return {
        success: false,
        errors: [
          {
            entityType: 'participacion',
            message:
              'Las bandas solo pueden participar en actividades de música y no se pueden combinar con artista o agrupación'
          }
        ]
      }
    }

    await db.transaction(async (tx) => {
      let participationRecord = null

      if (artistaId !== null) {
        participationRecord = await tx.query.editionParticipation.findFirst({
          where: (table, { and, eq }) =>
            and(eq(table.edicionId, edicionId), eq(table.artistaId, artistaId))
        })
      } else if (agrupacionId !== null) {
        participationRecord = await tx.query.editionParticipation.findFirst({
          where: (table, { and, eq }) =>
            and(
              eq(table.edicionId, edicionId),
              eq(table.agrupacionId, agrupacionId)
            )
        })
      } else if (bandaId !== null) {
        participationRecord = await tx.query.editionParticipation.findFirst({
          where: (table, { and, eq }) =>
            and(eq(table.edicionId, edicionId), eq(table.bandaId, bandaId))
        })
      }

      let participacionId: number

      if (!participationRecord) {
        const [inserted] = await tx
          .insert(editionParticipation)
          .values({
            edicionId,
            artistaId,
            agrupacionId,
            bandaId
          })
          .returning({ id: editionParticipation.id })
        participacionId = inserted.id
      } else {
        participacionId = participationRecord.id
      }

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

      await tx.insert(activity).values({
        participacionActividadId: insertedActivity.id,
        titulo: titulo || null,
        descripcion: descripcion || null,
        duracionMinutos,
        ubicacion: ubicacion || null,
        horaInicio: horaInicio || null,
        cupos
      })
    })

    updateTag(ACTIVIDAD_CACHE_TAG)

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
