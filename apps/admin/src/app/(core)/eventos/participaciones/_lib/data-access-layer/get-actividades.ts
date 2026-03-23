import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc, inArray } from 'drizzle-orm'
import type { Actividad } from '../../_schemas/participaciones.schema'
import { ACTIVIDAD_CACHE_TAG } from '../../_constants'

const { participationActivity } = participations

export async function getActividades(
  participationIds: number[]
): Promise<Actividad[]> {
  'use cache'
  cacheTag(ACTIVIDAD_CACHE_TAG)

  if (participationIds.length === 0) {
    return []
  }

  return db
    .select({
      id: participationActivity.id,
      participacionId: participationActivity.participacionId,
      tipoActividadId: participationActivity.tipoActividadId,
      postulacionId: participationActivity.postulacionId,
      modoIngresoId: participationActivity.modoIngresoId,
      puntaje: participationActivity.puntaje,
      estado: participationActivity.estado,
      notas: participationActivity.notas
    })
    .from(participationActivity)
    .where(inArray(participationActivity.participacionId, participationIds))
    .orderBy(asc(participationActivity.id))
}
