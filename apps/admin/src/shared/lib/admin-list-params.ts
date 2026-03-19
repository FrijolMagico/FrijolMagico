import { z } from 'zod'
import {
  ADMIN_LIST_FILTER_PARAM_PATTERN,
  ADMIN_LIST_QUERY_DEFAULTS,
  ADMIN_LIST_QUERY_PARAM_KEYS
} from '@/shared/lib/admin-list-contract'
import type { ListFilters, ListQueryParams } from '@/shared/types/pagination'

const positiveIntegerSchema = z.coerce.number().int().positive()

export type SearchParamValue = string | string[] | undefined

export interface RawAdminListSearchParams {
  [key: string]: SearchParamValue
}

interface ParseAdminListParamsOptions<TFilters extends ListFilters> {
  defaultPage?: number
  defaultPageSize?: number
  allowedFilters?: readonly (keyof TFilters & string)[]
}

function getFirstValue(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number
): number {
  const parsed = positiveIntegerSchema.safeParse(value)

  if (!parsed.success) {
    return fallback
  }

  return parsed.data
}

function normalizeEntries(
  searchParams?: RawAdminListSearchParams | URLSearchParams | null
): Array<[string, string]> {
  if (!searchParams) {
    return []
  }

  if (searchParams instanceof URLSearchParams) {
    return Array.from(searchParams.entries())
  }

  return Object.entries(searchParams).flatMap(([key, value]) => {
    const firstValue = getFirstValue(value)

    if (firstValue === undefined) {
      return []
    }

    return [[key, firstValue]]
  })
}

export function parseAdminListParams<
  TFilters extends ListFilters = ListFilters
>(
  searchParams?: RawAdminListSearchParams | URLSearchParams | null,
  options: ParseAdminListParamsOptions<TFilters> = {}
): ListQueryParams<TFilters> {
  const defaultPage = options.defaultPage ?? ADMIN_LIST_QUERY_DEFAULTS.page
  const defaultPageSize =
    options.defaultPageSize ?? ADMIN_LIST_QUERY_DEFAULTS.limit
  const allowedFilters = options.allowedFilters
    ? new Set<string>(options.allowedFilters)
    : null
  const filters: Partial<TFilters> = {}

  const entries = normalizeEntries(searchParams)
  const rawParams = new Map(entries)

  for (const [key, value] of entries) {
    const match = ADMIN_LIST_FILTER_PARAM_PATTERN.exec(key)

    if (!match) {
      continue
    }

    const filterKey = match[1]

    if (allowedFilters && !allowedFilters.has(filterKey)) {
      continue
    }

    const normalizedValue = value.trim()

    if (!normalizedValue) {
      continue
    }

    filters[filterKey as keyof TFilters] =
      normalizedValue as TFilters[keyof TFilters]
  }

  return {
    page: parsePositiveInteger(
      rawParams.get(ADMIN_LIST_QUERY_PARAM_KEYS.PAGE),
      defaultPage
    ),
    pageSize: parsePositiveInteger(
      rawParams.get(ADMIN_LIST_QUERY_PARAM_KEYS.LIMIT),
      defaultPageSize
    ),
    search: rawParams.get(ADMIN_LIST_QUERY_PARAM_KEYS.SEARCH)?.trim() ?? '',
    filters: filters as TFilters
  }
}
