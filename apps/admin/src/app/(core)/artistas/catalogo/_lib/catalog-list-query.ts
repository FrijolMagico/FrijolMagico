import type { CatalogListQueryFilters } from '@/shared/types/admin-list-filters'
import type { ListQueryParams } from '@/shared/types/pagination'

export interface CatalogListQuery {
  page: number
  pageSize: number
  search: string
  activo: boolean | null
  destacado: boolean | null
}

export const DEFAULT_CATALOG_LIST_PARAMS: ListQueryParams<CatalogListQueryFilters> =
  {
    page: 1,
    pageSize: 20,
    search: '',
    filters: {}
  }

function parseNullableBoolean(value: string | undefined): boolean | null {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

export function normalizeCatalogListQuery(
  params: ListQueryParams<CatalogListQueryFilters> = DEFAULT_CATALOG_LIST_PARAMS
): CatalogListQuery {
  return {
    page: Math.max(1, params.page),
    pageSize: Math.max(1, params.pageSize),
    search: params.search.trim(),
    activo: parseNullableBoolean(params.filters.activo),
    destacado: parseNullableBoolean(params.filters.destacado)
  }
}
