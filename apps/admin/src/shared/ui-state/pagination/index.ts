/**
 * @fileoverview
 * Pagination module for managing client-side navigation state in the admin panel.
 *
 * This module provides a factory to create Zustand-based pagination stores,
 * supporting automatic boundary handling, computed ranges for slicing data,
 * and optional bidirectional URL synchronization.
 *
 * @example
 * ```typescript
 * // 1. Create the store
 * export const useCatalogPagination = createPaginationStore({
 *   storeName: 'catalog'
 * })
 *
 * // 2. Use in components
 * function MyComponent() {
 *   const store = useCatalogPagination()
 *   usePaginationUrlSync(useCatalogPagination)
 *
 *   const { page, goNext } = store()
 *   // ...
 * }
 * ```
 */

export type {
  PaginationStore,
  CreatePaginationStoreConfig,
  PaginationState,
  PaginationActions,
  PaginationSlice
} from './pagination-types'

export { createPaginationStore } from './pagination-factory'

export type { PaginationUrlSyncConfig } from './pagination-url-sync'
export { usePaginationUrlSync } from './pagination-url-sync'
