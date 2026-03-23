import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc, inArray } from 'drizzle-orm'
import type { Exposicion } from '../../_schemas/participaciones.schema'
import { EXPOSICION_CACHE_TAG } from '../../_constants'

const { participationExhibition } = participations

export async function getExposiciones(
  participationIds: number[]
): Promise<Exposicion[]> {
  'use cache'
  cacheTag(EXPOSICION_CACHE_TAG)

  if (participationIds.length === 0) {
    return []
  }

  return db
    .select({
      id: participationExhibition.id,
      participacionId: participationExhibition.participacionId,
      disciplinaId: participationExhibition.disciplinaId,
      postulacionId: participationExhibition.postulacionId,
      modoIngresoId: participationExhibition.modoIngresoId,
      puntaje: participationExhibition.puntaje,
      estado: participationExhibition.estado,
      notas: participationExhibition.notas
    })
    .from(participationExhibition)
    .where(inArray(participationExhibition.participacionId, participationIds))
    .orderBy(asc(participationExhibition.id))
}
