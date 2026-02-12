import { createPaginationStore } from '@/shared/ui-state/pagination'
import { useShallow } from 'zustand/react/shallow'

export const useCatalogPaginationStore = createPaginationStore({
  storeName: 'catalogo',
  defaultPageSize: 20,
  urlSync: true,
  urlParams: { page: 'page', pageSize: 'pageSize' }
})

export function useCatalogPagination() {
  return useCatalogPaginationStore(
    useShallow((state) => ({
      // State
      page: state.page,
      pageSize: state.pageSize,
      totalItems: state.totalItems,
      // Computed
      getTotalPages: state.getTotalPages,
      getVisibleRange: state.getVisibleRange,
      // Actions
      setPage: state.setPage,
      setPageSize: state.setPageSize,
      setTotalItems: state.setTotalItems,
      reset: state.reset,
      goNext: state.goNext,
      goPrev: state.goPrev
    }))
  )
}

// Selective facades for performance
export function useCatalogPaginationState() {
  return useCatalogPaginationStore(
    useShallow((state) => ({
      page: state.page,
      pageSize: state.pageSize,
      totalItems: state.totalItems,
      getTotalPages: state.getTotalPages,
      getVisibleRange: state.getVisibleRange
    }))
  )
}

export function useCatalogPaginationActions() {
  return useCatalogPaginationStore(
    useShallow((state) => ({
      setPage: state.setPage,
      setPageSize: state.setPageSize,
      setTotalItems: state.setTotalItems,
      reset: state.reset,
      goNext: state.goNext,
      goPrev: state.goPrev
    }))
  )
}
