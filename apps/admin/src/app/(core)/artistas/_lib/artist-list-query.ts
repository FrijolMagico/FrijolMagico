import type { ArtistListQueryFilters } from '@/shared/types/admin-list-filters'
import type { ListQueryParams } from '@/shared/types/pagination'

export interface ArtistListQuery {
  page: number
  pageSize: number
  search: string
  country: string | null
  city: string | null
  statusId: number | null
}

export const DEFAULT_ARTIST_LIST_PARAMS: ListQueryParams<ArtistListQueryFilters> =
  {
    page: 1,
    pageSize: 20,
    search: '',
    filters: {}
  }

function normalizeFilterValue(value: string | undefined): string | null {
  const normalizedValue = value?.trim() ?? ''
  return normalizedValue ? normalizedValue : null
}

function parseStatusId(value: string | undefined): number | null {
  const normalizedValue = normalizeFilterValue(value)

  if (!normalizedValue) {
    return null
  }

  const parsedStatusId = Number.parseInt(normalizedValue, 10)

  if (!Number.isInteger(parsedStatusId) || parsedStatusId <= 0) {
    return null
  }

  return parsedStatusId
}

export function normalizeArtistListQuery(
  params: ListQueryParams<ArtistListQueryFilters> = DEFAULT_ARTIST_LIST_PARAMS
): ArtistListQuery {
  return {
    page: Math.max(1, params.page),
    pageSize: Math.max(1, params.pageSize),
    search: params.search.trim(),
    country: normalizeFilterValue(params.filters.country),
    city: normalizeFilterValue(params.filters.city),
    statusId: parseStatusId(params.filters.statusId)
  }
}
