'use client'

import { useEffect, useMemo } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { PaginationStore } from '@/shared/ui-state/pagination'

export interface PaginatedSliceOptions<T, TKey extends string> {
  /** Full server-fetched dataset */
  items: T[]
  /** Keys of item fields to search over (case-insensitive substring match) */
  searchFields?: (keyof T)[]
  /** Search term — filters items whose searchFields contain this string */
  searchTerm?: string
  /** Extra filter predicates (AND-combined) */
  filters?: Array<(item: T) => boolean>
  /** Sort comparator applied after filtering */
  sortFn?: (a: T, b: T) => number
  /** The pagination store to read page/pageSize from and update totalItems */
  paginationStore: UseBoundStore<StoreApi<PaginationStore>>
  /** Field to use as stable DnD id (reserved for API completeness) */
  idField: TKey
}

export interface PaginatedSliceResult<T> {
  /** Items for the current page only */
  paginatedItems: T[]
  /** Total number of items after filtering (before pagination) */
  totalFilteredItems: number
  /**
   * Full filtered+sorted list before pagination.
   * Required for DnD — fractional key computation needs all neighbors, not just the current page.
   */
  filteredItems: T[]
}

/**
 * Generic hook that applies search, filter, sort, and pagination to a dataset.
 *
 * Operations are applied in order: search filter → extra filters → sort → page slice.
 *
 * Automatically updates the pagination store's totalItems when the filtered count changes,
 * and resets to page 1 when filter inputs change (to avoid empty pages after filtering).
 *
 * @example
 * ```tsx
 * const { paginatedItems, filteredItems, totalFilteredItems } = usePaginatedSlice({
 *   items: catalog,
 *   searchFields: ['nombre', 'pseudonimo'],
 *   searchTerm: filters.search,
 *   filters: [filters.activo !== null ? (i) => i.activo === filters.activo : null].filter(Boolean),
 *   sortFn: (a, b) => a.orden.localeCompare(b.orden),
 *   paginationStore: useCatalogPaginationStore,
 *   idField: 'id'
 * })
 * ```
 */
export function usePaginatedSlice<T, TKey extends keyof T & string>(
  options: PaginatedSliceOptions<T, TKey>
): PaginatedSliceResult<T> {
  const { items, searchFields, searchTerm, filters, sortFn, paginationStore } =
    options

  // Read pagination state from store
  const page = paginationStore((s) => s.page)
  const pageSize = paginationStore((s) => s.pageSize)

  const normalizedSearch = searchTerm?.trim().toLowerCase() ?? ''

  // Compute filtered + sorted list (memoized by reference stability)
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return []

    // Step 1: Search filter
    let result = items
    if (normalizedSearch && searchFields && searchFields.length > 0) {
      result = items.filter((item) =>
        searchFields.some((field) => {
          const val = item[field]
          return (
            typeof val === 'string' &&
            val.toLowerCase().includes(normalizedSearch)
          )
        })
      )
    }

    // Step 2: Extra filter predicates (AND-combined)
    if (filters && filters.length > 0) {
      for (const predicate of filters) {
        result = result.filter(predicate)
      }
    }

    // Step 3: Sort
    if (sortFn) {
      result = [...result].sort(sortFn)
    }

    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, normalizedSearch, filters, sortFn])

  const totalFilteredItems = filteredItems.length

  // Step 4: Page slice
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredItems.slice(startIndex, endIndex)
  }, [filteredItems, page, pageSize])

  // Effect: sync totalItems to pagination store when filtered count changes
  useEffect(() => {
    const currentTotal = paginationStore.getState().totalItems
    if (currentTotal !== totalFilteredItems) {
      paginationStore.getState().setTotalItems(totalFilteredItems)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFilteredItems])

  // Effect: reset to page 1 when filter inputs change
  useEffect(() => {
    paginationStore.getState().reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedSearch, filters])

  return {
    paginatedItems,
    totalFilteredItems,
    filteredItems
  }
}
