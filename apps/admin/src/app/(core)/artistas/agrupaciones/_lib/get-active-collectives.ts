import 'server-only'

import { cacheTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, count, isNull, sql } from 'drizzle-orm'
import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { COLLECTIVE_ACTIVE_CACHE_TAG } from '../_constants'
import {
  collectiveQueryParamsSchema,
  type CollectiveQueryParams
} from '../_schemas/query-params.schema'
import type { CollectiveRow } from '../_types/collective.types'

const { collective } = artist

function buildActiveWhereClause(query: CollectiveQueryParams) {
  const conditions = [isNull(collective.deletedAt)]

  if (query.search) {
    const searchTerm = `%${query.search.toLowerCase()}%`

    conditions.push(sql`(
      lower(coalesce(${collective.nombre}, '')) like ${searchTerm}
      or lower(coalesce(${collective.descripcion}, '')) like ${searchTerm}
      or lower(coalesce(${collective.correo}, '')) like ${searchTerm}
    )`)
  }

  return and(...conditions)
}

export async function getActiveCollectives(
  queryParams: unknown
): Promise<PaginatedResponse<CollectiveRow>> {
  'use cache'
  cacheTag(COLLECTIVE_ACTIVE_CACHE_TAG)

  const query = collectiveQueryParamsSchema.parse(queryParams)
  const whereClause = buildActiveWhereClause(query)
  const offset = (query.page - 1) * query.limit

  const [results, totalResult] = await Promise.all([
    db
      .select({
        id: collective.id,
        nombre: collective.nombre,
        descripcion: collective.descripcion,
        correo: collective.correo,
        activo: collective.activo,
        createdAt: collective.createdAt,
        memberCount: sql<number>`(
          SELECT COUNT(*)
          FROM agrupacion_artista aa
          WHERE aa.agrupacion_id = ${collective.id}
            AND aa.activo = 1
        )`
      })
      .from(collective)
      .where(whereClause)
      .orderBy(asc(collective.nombre))
      .limit(query.limit)
      .offset(offset),
    db.select({ total: count() }).from(collective).where(whereClause)
  ])

  return createPaginatedResponse(results, {
    total: totalResult[0]?.total ?? 0,
    page: query.page,
    pageSize: query.limit
  })
}
