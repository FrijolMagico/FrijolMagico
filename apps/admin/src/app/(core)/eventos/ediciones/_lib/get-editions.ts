import 'server-only'
import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { and, asc, count, eq, sql } from 'drizzle-orm'
import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { EDITION_CACHE_TAG } from '../_constants'
import {
  editionQueryParamsSchema,
  type EditionsQueryParams
} from '../_schemas/query-params.schema'
import type { Edition } from '../_schemas/edicion.schema'

const { eventEdition } = events

interface EditionRow extends Omit<Edition, 'eventoId'> {
  eventoId: number | null
}

function isEditionRow(row: EditionRow): row is Edition {
  return row.eventoId !== null
}

function buildEditionWhereClause(query: EditionsQueryParams) {
  const conditions = [sql`${eventEdition.eventoId} IS NOT NULL`]

  if (query.evento !== null) {
    conditions.push(eq(eventEdition.eventoId, query.evento))
  }

  if (query.search) {
    const searchTerm = `%${query.search.toLowerCase()}%`

    conditions.push(sql`(
      lower(coalesce(${eventEdition.nombre}, '')) like ${searchTerm}
      or lower(${eventEdition.numeroEdicion}) like ${searchTerm}
    )`)
  }

  return and(...conditions)
}

export async function getEditions(
  queryParams: unknown
): Promise<PaginatedResponse<Edition>> {
  'use cache'
  cacheTag(EDITION_CACHE_TAG)

  const query = editionQueryParamsSchema.parse(queryParams)
  const whereClause = buildEditionWhereClause(query)
  const offset = (query.page - 1) * query.limit

  const [results, totalResult] = await Promise.all([
    db
      .select({
        id: eventEdition.id,
        eventoId: eventEdition.eventoId,
        nombre: eventEdition.nombre,
        numeroEdicion: eventEdition.numeroEdicion,
        slug: eventEdition.slug,
        posterUrl: eventEdition.posterUrl
      })
      .from(eventEdition)
      .where(whereClause)
      .orderBy(asc(eventEdition.createdAt))
      .limit(query.limit)
      .offset(offset),
    db.select({ total: count() }).from(eventEdition).where(whereClause)
  ])

  return createPaginatedResponse(results.filter(isEditionRow), {
    total: totalResult[0]?.total ?? 0,
    page: query.page,
    pageSize: query.limit
  })
}
