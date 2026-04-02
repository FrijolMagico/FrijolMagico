import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc, inArray } from 'drizzle-orm'
import type { Exhibition } from '@/core/eventos/participaciones/_schemas/exhibition.schema'
import { getParticipationExhibitionsCacheTag } from '../../_constants/cache-tags'
import {
  DisciplineId,
  EntryModeId
} from '../../_constants/participations.constants'

const { participationExhibition } = participations

export async function getExhibitions(
  participationIds: number[]
): Promise<Exhibition[]> {
  'use cache'
  if (participationIds.length === 0) {
    return []
  }

  for (const participationId of participationIds) {
    cacheTag(getParticipationExhibitionsCacheTag(participationId))
  }

  const result = await db
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

  return result.map((exhibition) => ({
    ...exhibition,
    disciplinaId: exhibition.disciplinaId as DisciplineId,
    modoIngresoId: exhibition.modoIngresoId as EntryModeId
  }))
}
