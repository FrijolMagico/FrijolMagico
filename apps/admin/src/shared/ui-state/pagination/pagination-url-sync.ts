'use client'

import { useEffect } from 'react'
import { useQueryStates, parseAsInteger } from 'nuqs'
import type { UseBoundStore, StoreApi } from 'zustand'

/**
 * Configuration for pagination URL synchronization.
 */
export interface PaginationUrlSyncConfig {
  /**
   * URL parameter name for the current page number.
   * @default 'page'
   */
  pageParam?: string
  /**
   * URL parameter name for the number of items per page.
   * @default 'pageSize'
   */
  pageSizeParam?: string
  /**
   * Default page size to use when the URL parameter is missing.
   * @default 20
   */
  defaultPageSize?: number
}

/**
 * React hook for bidirectional URL synchronization with a pagination store.
 *
 * This hook leverages `nuqs` for type-safe query parameter management. It ensures that:
 * 1. Store changes are reflected in the URL.
 * 2. URL changes (e.g., back/forward navigation) update the store state.
 *
 * **CRITICAL**: This hook MUST be mounted in a React Client Component for sync to function.
 *
 * @example
 * ```tsx
 * function CatalogPage() {
 *   const store = useCatalogPaginationStore()
 *
 *   // Enable URL sync
 *   usePaginationUrlSync(store, {
 *     pageParam: 'p',
 *     pageSizeParam: 'size'
 *   })
 *
 *   return <PaginationControls store={store} />
 * }
 * ```
 *
 * @template T - Type of the pagination store, ensuring it has required state and actions
 * @param store - Zustand pagination store instance
 * @param config - Optional configuration for parameter names and defaults
 */
export function usePaginationUrlSync<
  T extends {
    page: number
    pageSize: number
    setPage: (page: number) => void
    setPageSize: (size: number) => void
  }
>(store: UseBoundStore<StoreApi<T>>, config: PaginationUrlSyncConfig = {}) {
  const {
    pageParam = 'page',
    pageSizeParam = 'pageSize',
    defaultPageSize = 20
  } = config

  const [urlState, setUrlState] = useQueryStates(
    {
      [pageParam]: parseAsInteger.withDefault(1),
      [pageSizeParam]: parseAsInteger.withDefault(defaultPageSize)
    },
    {
      shallow: true
    }
  )

  const urlPage = urlState[pageParam] ?? 1
  const urlPageSize = urlState[pageSizeParam] ?? defaultPageSize

  const storePage = store((state) => state.page)
  const storePageSize = store((state) => state.pageSize)

  useEffect(() => {
    const currentState = store.getState()

    if (urlPage !== currentState.page) {
      currentState.setPage(urlPage)
    }
    if (urlPageSize !== currentState.pageSize) {
      currentState.setPageSize(urlPageSize)
    }
  }, [urlPage, urlPageSize, store])

  useEffect(() => {
    if (storePage !== urlPage || storePageSize !== urlPageSize) {
      setUrlState({
        [pageParam]: storePage,
        [pageSizeParam]: storePageSize
      })
    }
  }, [
    storePage,
    storePageSize,
    urlPage,
    urlPageSize,
    pageParam,
    pageSizeParam,
    setUrlState
  ])
}
