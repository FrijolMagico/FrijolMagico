import 'server-only'
import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { asc, inArray } from 'drizzle-orm'
import { EDITION_DAY_CACHE_TAG } from '../_constants'
import type { EditionDay } from '../_schemas/edicion.schema'

const { eventEditionDay } = events

export async function getEditionDays(
  editionIds: number[]
): Promise<EditionDay[]> {
  'use cache'
  cacheTag(EDITION_DAY_CACHE_TAG)

  if (editionIds.length === 0) {
    return []
  }

  return db
    .select({
      id: eventEditionDay.id,
      eventoEdicionId: eventEditionDay.eventoEdicionId,
      lugarId: eventEditionDay.lugarId,
      fecha: eventEditionDay.fecha,
      horaInicio: eventEditionDay.horaInicio,
      horaFin: eventEditionDay.horaFin,
      modalidad: eventEditionDay.modalidad
    })
    .from(eventEditionDay)
    .where(inArray(eventEditionDay.eventoEdicionId, editionIds))
    .orderBy(asc(eventEditionDay.fecha))
}
