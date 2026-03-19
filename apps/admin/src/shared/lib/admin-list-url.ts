import {
  ADMIN_LIST_QUERY_DEFAULTS,
  ADMIN_LIST_QUERY_PARAM_KEYS,
  createAdminListFilterParamName
} from '@/shared/lib/admin-list-contract'

export type AdminListUrlValue = string | number | boolean | null | undefined

type SearchParamsSource =
  | string
  | URLSearchParams
  | { toString(): string }
  | null
  | undefined

export interface UpdateAdminListUrlOptions {
  page?: number | null
  pageSize?: number | null
  search?: string | null
  filters?: Record<string, AdminListUrlValue>
}

function createMutableSearchParams(
  searchParams?: SearchParamsSource
): URLSearchParams {
  if (!searchParams) {
    return new URLSearchParams()
  }

  if (searchParams instanceof URLSearchParams) {
    return new URLSearchParams(searchParams)
  }

  return new URLSearchParams(searchParams.toString())
}

function setOrDeleteParam(
  searchParams: URLSearchParams,
  key: string,
  value: AdminListUrlValue
) {
  if (value === null || value === undefined || value === '') {
    searchParams.delete(key)
    return
  }

  searchParams.set(key, String(value))
}

export function updateAdminListSearchParams(
  searchParams?: SearchParamsSource,
  updates: UpdateAdminListUrlOptions = {}
): URLSearchParams {
  const nextParams = createMutableSearchParams(searchParams)

  if (updates.page !== undefined) {
    if (
      updates.page === null ||
      updates.page <= ADMIN_LIST_QUERY_DEFAULTS.page
    ) {
      nextParams.delete(ADMIN_LIST_QUERY_PARAM_KEYS.PAGE)
    } else {
      nextParams.set(ADMIN_LIST_QUERY_PARAM_KEYS.PAGE, String(updates.page))
    }
  }

  if (updates.pageSize !== undefined) {
    if (
      updates.pageSize === null ||
      updates.pageSize <= 0 ||
      updates.pageSize === ADMIN_LIST_QUERY_DEFAULTS.limit
    ) {
      nextParams.delete(ADMIN_LIST_QUERY_PARAM_KEYS.LIMIT)
    } else {
      nextParams.set(
        ADMIN_LIST_QUERY_PARAM_KEYS.LIMIT,
        String(updates.pageSize)
      )
    }
  }

  if (updates.search !== undefined) {
    const normalizedSearch = updates.search?.trim() ?? ''

    if (!normalizedSearch) {
      nextParams.delete(ADMIN_LIST_QUERY_PARAM_KEYS.SEARCH)
    } else {
      nextParams.set(ADMIN_LIST_QUERY_PARAM_KEYS.SEARCH, normalizedSearch)
    }
  }

  if (updates.filters) {
    for (const [key, value] of Object.entries(updates.filters)) {
      setOrDeleteParam(nextParams, createAdminListFilterParamName(key), value)
    }
  }

  return nextParams
}

export function buildAdminListUrl(
  searchParams?: SearchParamsSource,
  updates: UpdateAdminListUrlOptions = {}
): string {
  const nextParams = updateAdminListSearchParams(searchParams, updates)
  const query = nextParams.toString()

  return query ? `?${query}` : ''
}
