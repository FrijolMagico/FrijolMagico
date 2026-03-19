export type ListFilters = Record<string, string | undefined>

export interface ListQueryParams<TFilters extends ListFilters = ListFilters> {
  page: number
  pageSize: number
  search: string
  filters: TFilters
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type PaginatedResult<T> = PaginatedResponse<T>

interface CreatePaginatedResponseOptions {
  total: number
  page: number
  pageSize: number
}

export function getTotalPages(total: number, pageSize: number): number {
  if (total <= 0) return 0

  return Math.ceil(total / Math.max(1, pageSize))
}

export function createPaginatedResponse<T>(
  data: T[],
  options: CreatePaginatedResponseOptions
): PaginatedResponse<T> {
  return {
    data,
    total: options.total,
    page: options.page,
    pageSize: options.pageSize,
    totalPages: getTotalPages(options.total, options.pageSize)
  }
}

export const createPaginatedResult = createPaginatedResponse
