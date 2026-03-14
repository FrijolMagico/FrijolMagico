'use server'

import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import { PARTICIPACIONES_CACHE_TAG } from '../../_constants'
import { ParticipationStatus, isParticipationStatus } from '../../_types'

const { editionParticipation, participationExhibition } = participations

function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  return typeof value === 'string' ? value : null
}

export async function addExpositorAction(
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
    const disciplinaId = Number(formData.get('disciplinaId'))
    const modoIngresoId = Number(formData.get('modoIngresoId')) || 1
    const rawEstado = getFormString(formData, 'estado')
    const estado: ParticipationStatus =
      rawEstado !== null && isParticipationStatus(rawEstado)
        ? rawEstado
        : 'seleccionado'
    const notas = getFormString(formData, 'notas')

    if (!edicionId || !disciplinaId || (!artistaId && !agrupacionId)) {
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

      // 2. Insert the exhibition record linking to the participation ID
      await tx.insert(participationExhibition).values({
        participacionId,
        disciplinaId,
        modoIngresoId,
        estado,
        notas
      })
    })

    updateTag(PARTICIPACIONES_CACHE_TAG)

    return { success: true }
  } catch (error) {
    console.error('[addExpositorAction]', error)
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
