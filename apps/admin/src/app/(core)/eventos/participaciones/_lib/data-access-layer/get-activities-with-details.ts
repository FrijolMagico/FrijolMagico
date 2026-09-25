import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc, eq, inArray } from 'drizzle-orm'
import type { ActivityDetail } from '@/core/eventos/participaciones/_schemas/activity.schema'
import { utcToChileLocal } from '../activity-registration-time'
import { getParticipationActivitiesCacheTag } from '@frijolmagico/cache-tags'
import { ActivityWithDetail } from '../../_types/activity.types'

const { participationActivity, activity, activityRegistration } = participations

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
      detalleCupos: activity.cupos,
      registrationId: activityRegistration.id,
      registrationUrl: activityRegistration.url,
      registrationStartAt: activityRegistration.startAt,
      registrationEndAt: activityRegistration.endAt
    })
    .from(participationActivity)
    .leftJoin(
      activity,
      eq(activity.participacionActividadId, participationActivity.id)
    )
    .leftJoin(
      activityRegistration,
      eq(activityRegistration.participationActivityId, participationActivity.id)
    )
    .where(inArray(participationActivity.participacionId, participationIds))
    .orderBy(asc(participationActivity.id), asc(activity.id))

  return rows.map((row) => {
    const start =
      row.registrationId !== null && row.registrationStartAt !== null
        ? utcToChileLocal(row.registrationStartAt)
        : null
    const end =
      row.registrationId !== null && row.registrationEndAt !== null
        ? utcToChileLocal(row.registrationEndAt)
        : null
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

    const registration =
      row.registrationId === null ||
      row.registrationUrl === null ||
      start === null ||
      end === null
        ? null
        : {
            url: row.registrationUrl,
            startDate: start.date,
            startTime: start.time,
            endDate: end.date,
            endTime: end.time
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
      detail,
      registration
    }
  })
}
