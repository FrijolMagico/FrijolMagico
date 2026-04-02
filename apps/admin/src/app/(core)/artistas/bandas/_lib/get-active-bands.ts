import 'server-only'
import * as nextCache from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { asc, count, isNull } from 'drizzle-orm'
import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { BAND_ACTIVE_CACHE_TAG } from '../_constants'
import {
  bandQueryParamsSchema,
  type BandQueryParams
} from '../_schemas/query-params.schema'
import type { BandRow } from '../_types/band'

const bandTable = artist.band

export async function getActiveBands(
  queryParams: unknown
): Promise<PaginatedResponse<BandRow>> {
  'use cache'

  nextCache.cacheTag?.(BAND_ACTIVE_CACHE_TAG)

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
        createdAt: bandTable.createdAt
      })
      .from(bandTable)
      .where(isNull(bandTable.deletedAt))
      .orderBy(asc(bandTable.name))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(bandTable)
      .where(isNull(bandTable.deletedAt))
  ])

  return createPaginatedResponse(results, {
    total: totalResult[0]?.total ?? 0,
    page: query.page,
    pageSize: query.pageSize
  })
}

export type { BandQueryParams }
