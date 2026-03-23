import 'server-only'

import { cacheTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, count, isNotNull, sql } from 'drizzle-orm'
import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { AGRUPACION_DELETED_CACHE_TAG } from '../_constants'
import {
  agrupacionQueryParamsSchema,
  type AgrupacionQueryParams
} from '../_schemas/query-params.schema'
import type { DeletedAgrupacionRow } from '../_types/agrupacion'

const { collective } = artist

function buildDeletedWhereClause(query: AgrupacionQueryParams) {
  const conditions = [isNotNull(collective.deletedAt)]

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

export async function getDeletedAgrupaciones(
  queryParams: unknown
): Promise<PaginatedResponse<DeletedAgrupacionRow>> {
  'use cache'
  cacheTag(AGRUPACION_DELETED_CACHE_TAG)

  const query = agrupacionQueryParamsSchema.parse(queryParams)
  const whereClause = buildDeletedWhereClause(query)
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
        deletedAt: collective.deletedAt,
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

  return createPaginatedResponse(
    results.filter(
      (item): item is DeletedAgrupacionRow =>
        item.deletedAt !== null && item.deletedAt !== undefined
    ),
    {
      total: totalResult[0]?.total ?? 0,
      page: query.page,
      pageSize: query.limit
    }
  )
}
