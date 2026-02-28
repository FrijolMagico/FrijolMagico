/**
 * Core pagination state representing the current navigation context.
 */
export interface PaginationState {
  /** Current page number (1-based) */
  page: number
  /** Number of items per page */
  pageSize: number
  /** Total number of items across all pages */
  totalItems: number
}

/**
 * Actions available to mutate the pagination state.
 * Includes automatic boundary handling and clamping.
 */
export interface PaginationActions {
  /**
   * Set the current page. Clamped between 1 and totalPages.
   * @param page - Target page number
   */
  setPage: (page: number) => void

  /**
   * Set the number of items per page. Resets current page to 1.
   * @param size - Number of items per page
   */
  setPageSize: (size: number) => void

  /**
   * Update the total number of items. May clamp current page if it's now out of bounds.
   * @param total - Total item count
   */
  setTotalItems: (total: number) => void

  /** Reset pagination to the first page */
  reset: () => void

  /** Advance to the next page if available */
  goNext: () => void

  /** Move to the previous page if available */
  goPrev: () => void
}

/**
 * Configuration options for creating a pagination store.
 */
export interface CreatePaginationStoreConfig {
  /** Unique store identifier for debugging and internal tracking */
  storeName: string
  /** Default page size (default: 20) */
  defaultPageSize?: number
  /** Maximum allowed page size to prevent over-fetching (default: 1000) */
  maxPageSize?: number
  /** Enable automatic URL synchronization (default: true) */
  urlSync?: boolean
  /** Custom URL query parameter names for mapping */
  urlParams?: {
    /** URL param name for page number (default: 'page') */
    page?: string
    /** URL param name for page size (default: 'pageSize') */
    pageSize?: string
  }
}

/**
 * Indices for slicing an array to display only the current page's items.
 * Compatible with `Array.prototype.slice(start, end)`.
 */
export interface PaginationSlice {
  /** Start index (0-based, inclusive) */
  startIndex: number
  /** End index (0-based, exclusive) */
  endIndex: number
}

/**
 * The complete pagination store including state, actions, and computed properties.
 */
export type PaginationStore = PaginationState &
  PaginationActions & {
    /**
     * Calculates total pages based on current totalItems and pageSize.
     * Always returns at least 1 page.
     * @returns Total number of pages
     */
    getTotalPages: () => number

    /**
     * Calculates the visible range indices for the current page.
     * @returns Slice indices for the current view
     */
    getVisibleRange: () => PaginationSlice
  }
