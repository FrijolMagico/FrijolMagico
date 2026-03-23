import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc, inArray } from 'drizzle-orm'
import type { ActividadDetalle } from '../../_schemas/participaciones.schema'
import { ACTIVIDAD_DETALLE_CACHE_TAG } from '../../_constants'

const { activity } = participations

export async function getActividadDetalles(
  actividadIds: number[]
): Promise<ActividadDetalle[]> {
  'use cache'
  cacheTag(ACTIVIDAD_DETALLE_CACHE_TAG)

  if (actividadIds.length === 0) {
    return []
  }

  return db
    .select({
      id: activity.id,
      participacionActividadId: activity.participacionActividadId,
      titulo: activity.titulo,
      descripcion: activity.descripcion,
      duracionMinutos: activity.duracionMinutos,
      ubicacion: activity.ubicacion,
      horaInicio: activity.horaInicio,
      cupos: activity.cupos
    })
    .from(activity)
    .where(inArray(activity.participacionActividadId, actividadIds))
    .orderBy(asc(activity.id))
}
