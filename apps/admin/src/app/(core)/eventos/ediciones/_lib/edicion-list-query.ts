import type { EdicionListQueryFilters } from '@/shared/types/admin-list-filters'
import type { ListQueryParams } from '@/shared/types/pagination'

export interface EdicionListQuery {
  page: number
  pageSize: number
  search: string
  eventoId: string | null
}

export const DEFAULT_EDICION_LIST_PARAMS: ListQueryParams<EdicionListQueryFilters> =
  {
    page: 1,
    pageSize: 20,
    search: '',
    filters: {}
  }

export function normalizeEdicionListQuery(
  params: ListQueryParams<EdicionListQueryFilters> = DEFAULT_EDICION_LIST_PARAMS
): EdicionListQuery {
  return {
    page: Math.max(1, params.page),
    pageSize: Math.max(1, params.pageSize),
    search: params.search.trim(),
    eventoId: params.filters.eventoId?.trim() || null
  }
}
