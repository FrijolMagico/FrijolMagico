import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist, participations } from '@frijolmagico/database/schema'
import { and, asc, count, sql } from 'drizzle-orm'
import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { participacionesQueryParamsSchema } from '../../_schemas/query-params.schema'
import type { Participacion } from '../../_schemas/participaciones.schema'
import { PARTICIPATIONS_CACHE_TAG } from '../../_constants'

const { editionParticipation, participationExhibition, participationActivity } =
  participations
const { artist: artistTable, collective, band } = artist

function buildSortLabel() {
  return sql<string>`lower(coalesce(
    (
      select ${artistTable.pseudonimo}
      from ${artistTable}
      where ${artistTable.id} = ${editionParticipation.artistaId}
    ),
    (
      select ${artistTable.nombre}
      from ${artistTable}
      where ${artistTable.id} = ${editionParticipation.artistaId}
    ),
    (
      select ${collective.nombre}
      from ${collective}
      where ${collective.id} = ${editionParticipation.agrupacionId}
    ),
    (
      select ${band.name}
      from ${band}
      where ${band.id} = ${editionParticipation.bandaId}
    ),
    'participante sin nombre'
  ))`
}

function buildWhereClause(edicionId: number, params: unknown) {
  const query = participacionesQueryParamsSchema.parse(params)
  const conditions = [sql`${editionParticipation.edicionId} = ${edicionId}`]

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

    conditions.push(sql`${buildSortLabel()} like ${searchTerm}`)
  }

  return {
    query,
    whereClause: and(...conditions)
  }
}

export async function getParticipacionesPaginated(
  edicionId: number,
  params: unknown
): Promise<PaginatedResponse<Participacion>> {
  'use cache'
  cacheTag(PARTICIPATIONS_CACHE_TAG)

  const { query, whereClause } = buildWhereClause(edicionId, params)
  const offset = (query.page - 1) * query.limit
  const sortLabel = buildSortLabel()

  const [results, totalResult] = await Promise.all([
    db
      .select({
        id: editionParticipation.id,
        edicionId: editionParticipation.edicionId,
        artistaId: editionParticipation.artistaId,
        agrupacionId: editionParticipation.agrupacionId,
        bandaId: editionParticipation.bandaId,
        notas: editionParticipation.notas
      })
      .from(editionParticipation)
      .where(whereClause)
      .groupBy(
        editionParticipation.id,
        editionParticipation.edicionId,
        editionParticipation.artistaId,
        editionParticipation.agrupacionId,
        editionParticipation.bandaId,
        editionParticipation.notas
      )
      .orderBy(sortLabel, asc(editionParticipation.id))
      .limit(query.limit)
      .offset(offset),
    db
      .select({ total: count(sql`distinct ${editionParticipation.id}`) })
      .from(editionParticipation)
      .where(whereClause)
  ])

  return createPaginatedResponse(results, {
    total: totalResult[0]?.total ?? 0,
    page: query.page,
    pageSize: query.limit
  })
}
