import { create } from 'zustand'
import type {
  PaginationStore,
  CreatePaginationStoreConfig,
  PaginationSlice
} from './pagination-types'

/**
 * Ensures a value is a finite number, otherwise returns the fallback.
 * @param value - Value to sanitize
 * @param fallback - Default value if sanitize fails
 * @returns A guaranteed finite number
 */
function sanitizeNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback
}

/**
 * Creates a pagination store for managing client-side navigation state.
 *
 * The store provides state tracking, navigation actions with boundary protection,
 * and computed properties for pagination math (total pages, visible range).
 *
 * @example
 * ```typescript
 * const usePagination = createPaginationStore({
 *   storeName: 'catalog',
 *   defaultPageSize: 10
 * })
 *
 * const { page, goNext } = usePagination()
 * ```
 *
 * @param config - Configuration options for the pagination store
 * @returns A Zustand store hook for pagination
 *
 * @see {@link CreatePaginationStoreConfig} for all config options
 */
export function createPaginationStore({
  defaultPageSize = 20,
  maxPageSize = 1000
}: CreatePaginationStoreConfig) {
  return create<PaginationStore>()((set, get) => {
    return {
      page: 1,
      pageSize: defaultPageSize,
      totalItems: 0,

      getTotalPages: () => {
        const { totalItems, pageSize } = get()
        return totalItems === 0 ? 1 : Math.ceil(totalItems / pageSize)
      },

      getVisibleRange: (): PaginationSlice => {
        const state = get()
        const startIndex = (state.page - 1) * state.pageSize
        const endIndex = Math.min(startIndex + state.pageSize, state.totalItems)
        return { startIndex, endIndex }
      },

      setPage: (page) => {
        const safePage = sanitizeNumber(page, 1)
        const totalPages = get().getTotalPages()
        const clamped = Math.max(1, Math.min(safePage, totalPages))
        set({ page: clamped })
      },

      setPageSize: (pageSize) => {
        const safeSize = sanitizeNumber(pageSize, defaultPageSize)
        const sanitized = Math.max(1, Math.min(safeSize, maxPageSize))
        set({ pageSize: sanitized, page: 1 })
      },

      setTotalItems: (totalItems) => {
        const current = get()
        const safeTotal = sanitizeNumber(totalItems, 0)
        const sanitized = Math.max(0, safeTotal)
        const newTotalPages =
          sanitized === 0 ? 1 : Math.ceil(sanitized / current.pageSize)
        const clampedPage = Math.min(current.page, newTotalPages)

        set({ totalItems: sanitized, page: clampedPage })
      },

      reset: () => {
        set({ page: 1 })
      },

      goNext: () => {
        const state = get()
        const totalPages = state.getTotalPages()
        if (state.page < totalPages) {
          const nextPage = state.page + 1
          set({ page: nextPage })
        }
      },

      goPrev: () => {
        const { page } = get()
        if (page > 1) {
          const prevPage = page - 1
          set({ page: prevPage })
        }
      }
    }
  })
}
