export const ADMIN_LIST_QUERY_PARAM_KEYS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'search'
} as const

export const ADMIN_LIST_QUERY_DEFAULTS = {
  page: 1,
  limit: 20,
  search: ''
} as const

export const ADMIN_LIST_FILTER_PARAM_PATTERN = /^filter\[(.+)\]$/

export const ADMIN_LIST_CONTRACT_EXAMPLE =
  '?page=1&limit=20&search=texto&filter[campo]=valor'

/**
 * Shared URL contract for admin list pages.
 *
 * Raw query params:
 * `?page=1&limit=20&search=texto&filter[campo]=valor`
 *
 * Normalized parser output:
 * `{ page, pageSize, search, filters }`
 *
 * Paginated response:
 * `{ data, total, page, pageSize, totalPages }`
 */
export function createAdminListFilterParamName(
  field: string
): `filter[${string}]` {
  return `filter[${field}]`
}
