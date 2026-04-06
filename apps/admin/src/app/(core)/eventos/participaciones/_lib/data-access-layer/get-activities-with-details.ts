import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc, eq, inArray } from 'drizzle-orm'
import type { ActivityDetail } from '@/core/eventos/participaciones/_schemas/activity.schema'
import { getParticipationActivitiesCacheTag } from '@/core/eventos/participaciones/_constants/cache-tags'
import { ActivityWithDetail } from '../../_types/activity.types'

const { participationActivity, activity } = participations

export async function getActivitiesWithDetails(
  participationIds: number[]
): Promise<ActivityWithDetail[]> {
  'use cache'
  if (participationIds.length === 0) {
    return []
  }

  for (const participationId of participationIds) {
    cacheTag(getParticipationActivitiesCacheTag(participationId))
  }

  const rows = await db
    .select({
      id: participationActivity.id,
      participacionId: participationActivity.participacionId,
      tipoActividadId: participationActivity.tipoActividadId,
      postulacionId: participationActivity.postulacionId,
      modoIngresoId: participationActivity.modoIngresoId,
      puntaje: participationActivity.puntaje,
      estado: participationActivity.estado,
      notas: participationActivity.notas,
      detalleId: activity.id,
      detalleParticipacionActividadId: activity.participacionActividadId,
      detalleTitulo: activity.titulo,
      detalleDescripcion: activity.descripcion,
      detalleDuracionMinutos: activity.duracionMinutos,
      detalleUbicacion: activity.ubicacion,
      detalleHoraInicio: activity.horaInicio,
      detalleCupos: activity.cupos
    })
    .from(participationActivity)
    .leftJoin(
      activity,
      eq(activity.participacionActividadId, participationActivity.id)
    )
    .where(inArray(participationActivity.participacionId, participationIds))
    .orderBy(asc(participationActivity.id), asc(activity.id))

  return rows.map((row) => {
    const detail: ActivityDetail | null =
      row.detalleId === null || row.detalleParticipacionActividadId === null
        ? null
        : {
            id: row.detalleId,
            participacionActividadId: row.detalleParticipacionActividadId,
            titulo: row.detalleTitulo,
            descripcion: row.detalleDescripcion,
            duracionMinutos: row.detalleDuracionMinutos,
            ubicacion: row.detalleUbicacion,
            horaInicio: row.detalleHoraInicio,
            cupos: row.detalleCupos
          }

    return {
      id: row.id,
      participacionId: row.participacionId,
      tipoActividadId: row.tipoActividadId,
      postulacionId: row.postulacionId,
      modoIngresoId: row.modoIngresoId,
      puntaje: row.puntaje,
      estado: row.estado,
      notas: row.notas,
      detail
    }
  })
}
