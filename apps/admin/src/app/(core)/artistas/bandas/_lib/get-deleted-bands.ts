import 'server-only'
import * as nextCache from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { count, desc, isNotNull } from 'drizzle-orm'
import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { BAND_DELETED_CACHE_TAG } from '../_constants'
import { bandQueryParamsSchema } from '../_schemas/query-params.schema'
import type { DeletedBandRow } from '../_types/band'

const bandTable = artist.band

export async function getDeletedBands(
  queryParams: unknown
): Promise<PaginatedResponse<DeletedBandRow>> {
  'use cache'

  nextCache.cacheTag?.(BAND_DELETED_CACHE_TAG)

  const query = bandQueryParamsSchema.parse(queryParams)
  const offset = (query.page - 1) * query.pageSize

  const [results, totalResult] = await Promise.all([
    db
      .select({
        id: bandTable.id,
        name: bandTable.name,
        description: bandTable.description,
        email: bandTable.email,
        phone: bandTable.phone,
        city: bandTable.city,
        country: bandTable.country,
        active: bandTable.active,
        createdAt: bandTable.createdAt,
        deletedAt: bandTable.deletedAt
      })
      .from(bandTable)
      .where(isNotNull(bandTable.deletedAt))
      .orderBy(desc(bandTable.deletedAt))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(bandTable)
      .where(isNotNull(bandTable.deletedAt))
  ])

  return createPaginatedResponse(results as DeletedBandRow[], {
    total: totalResult[0]?.total ?? 0,
    page: query.page,
    pageSize: query.pageSize
  })
}

export async function getDeletedBandCount(): Promise<number> {
  'use cache'

  nextCache.cacheTag?.(BAND_DELETED_CACHE_TAG)

  const result = await db
    .select({ total: count() })
    .from(bandTable)
    .where(isNotNull(bandTable.deletedAt))

  return result[0]?.total ?? 0
}
