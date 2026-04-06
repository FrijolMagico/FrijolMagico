import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist, participations } from '@frijolmagico/database/schema'
import { and, asc, eq, sql } from 'drizzle-orm'
import { participationsQueryParamsSchema } from '@/core/eventos/participaciones/_schemas/query-params.schema'

import { getEditionParticipationsCacheTag } from '@/core/eventos/participaciones/_constants/cache-tags'

const { editionParticipation, participationExhibition, participationActivity } =
  participations
const { artist: artistTable, collective, band } = artist

function buildSortLabel() {
  return sql<string>`lower(coalesce(
    ${artistTable.pseudonimo},
    ${artistTable.nombre},
    ${collective.nombre},
    ${band.name},
    'participante sin nombre'
  ))`
}

function buildWhereClause(
  edicionId: number,
  params: unknown,
  sortLabel: ReturnType<typeof buildSortLabel>
) {
  const query = participationsQueryParamsSchema.parse(params)
  const conditions = [
    // Filter by edition ID
    sql`${editionParticipation.edicionId} = ${edicionId}`,

    // Ensure that the participation is linked to at least one participant type
    sql`(
      ${editionParticipation.artistaId} is not null
      or ${editionParticipation.bandaId} is not null
      or ${editionParticipation.agrupacionId} is not null
    )`
  ]

  if (query.estado) {
    conditions.push(sql`(
      exists (
        select 1
        from ${participationExhibition}
        where ${participationExhibition.participacionId} = ${editionParticipation.id}
          and ${participationExhibition.estado} = ${query.estado}
      )
      or exists (
        select 1
        from ${participationActivity}
        where ${participationActivity.participacionId} = ${editionParticipation.id}
          and ${participationActivity.estado} = ${query.estado}
      )
    )`)
  }

  if (query.search) {
    const searchTerm = `%${query.search.trim().toLowerCase()}%`

    conditions.push(sql`${sortLabel} like ${searchTerm}`)
  }

  return {
    query,
    whereClause: and(...conditions)
  }
}

export async function getParticipations(edicionId: number, params: unknown) {
  'use cache'
  cacheTag(getEditionParticipationsCacheTag(edicionId))

  const sortLabel = buildSortLabel()
  const { whereClause } = buildWhereClause(edicionId, params, sortLabel)

  const results = await db
    .select({
      id: editionParticipation.id,
      edicionId: editionParticipation.edicionId,
      artistaId: editionParticipation.artistaId,
      agrupacionId: editionParticipation.agrupacionId,
      bandaId: editionParticipation.bandaId,
      notas: editionParticipation.notas
    })
    .from(editionParticipation)
    .leftJoin(artistTable, eq(artistTable.id, editionParticipation.artistaId))
    .leftJoin(collective, eq(collective.id, editionParticipation.agrupacionId))
    .leftJoin(band, eq(band.id, editionParticipation.bandaId))
    .where(whereClause)
    .orderBy(sortLabel, asc(editionParticipation.id))

  return results
}
