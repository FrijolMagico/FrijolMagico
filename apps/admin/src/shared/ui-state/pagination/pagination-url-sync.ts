'use client'

import { useEffect, useMemo } from 'react'
import { useQueryStates, parseAsInteger } from 'nuqs'
import type { UseBoundStore } from 'zustand'
import type { StoreApi } from 'zustand'
import type { PaginationStore } from './types'

/**
 * Configuration for pagination URL synchronization.
 */
export interface PaginationUrlSyncConfig {
  pageParam?: string
  pageSizeParam?: string
  defaultPageSize?: number
}

/**
 * React hook for bidirectional URL synchronization with a pagination store.
 *
 * Uses nuqs for URL state management. Syncs:
 * 1. URL → store on initial mount
 * 2. Store → URL when user interacts with pagination controls
 *
 * @param useStoreHook - Zustand store hook (e.g., useCatalogPaginationStore)
 * @param config - Parameter names and defaults
 */
export function usePaginationUrlSync(
  useStoreHook: UseBoundStore<StoreApi<PaginationStore>>,
  config: PaginationUrlSyncConfig = {}
) {
  const {
    pageParam = 'page',
    pageSizeParam = 'pageSize',
    defaultPageSize = 20
  } = config

  const nuqsShape = useMemo(
    () => ({
      [pageParam]: parseAsInteger.withDefault(1),
      [pageSizeParam]: parseAsInteger.withDefault(defaultPageSize)
    }),
    [pageParam, pageSizeParam, defaultPageSize]
  )

  const [urlState, setUrlState] = useQueryStates(nuqsShape, {
    shallow: true
  })

  const urlPage = urlState[pageParam] ?? 1
  const urlPageSize = urlState[pageSizeParam] ?? defaultPageSize

  // Subscribe to store changes - this causes re-render when store updates
  const storePage = useStoreHook((s) => s.page)
  const storePageSize = useStoreHook((s) => s.pageSize)
  const setPage = useStoreHook((s) => s.setPage)
  const setPageSize = useStoreHook((s) => s.setPageSize)

  // Initial sync: URL → store on mount
  useEffect(() => {
    if (urlPage !== storePage) {
      setPage(urlPage)
    }
    if (urlPageSize !== storePageSize) {
      setPageSize(urlPageSize)
    }
  }, []) // Only runs on mount

  // Store → URL: when user clicks pagination, sync to URL
  useEffect(() => {
    // Only sync if store differs from URL (user action, not URL change)
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
