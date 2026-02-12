import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { useShallow } from 'zustand/react/shallow'

export function useCatalogView() {
  // Get pagination state from dedicated store
  const pagination = useCatalogPaginationStore(
    useShallow((state) => ({
      page: state.page,
      pageSize: state.pageSize,
      totalItems: state.totalItems,
      getTotalPages: state.getTotalPages,
      getVisibleRange: state.getVisibleRange,
      setPage: state.setPage,
      setPageSize: state.setPageSize,
      setTotalItems: state.setTotalItems,
      reset: state.reset,
      goNext: state.goNext,
      goPrev: state.goPrev
    }))
  )

  // Get view state from existing store
  const viewState = useCatalogViewStore(
    useShallow((store) => ({
      // Filters
      filters: store.filters,
      setFilters: store.setFilters,

      // Drag & Drop
      isDragging: store.isDragging,
      draggedArtistId: store.draggedArtistId,
      startDrag: store.startDrag,
      endDrag: store.endDrag,

      // Dialogs
      catalogDialogOpen: store.catalogDialogOpen,
      artistDialogOpen: store.artistDialogOpen,
      selectedArtistId: store.selectedArtistId,

      openCatalogDialog: store.openCatalogDialog,
      closeCatalogDialog: store.closeCatalogDialog,
      openArtistDialog: store.openArtistDialog,
      closeArtistDialog: store.closeArtistDialog,
      closeAllDialogs: store.closeAllDialogs
    }))
  )

  // Return combined state for backward compatibility
  return {
    ...viewState,
    // Pagination from separate store
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    getTotalPages: pagination.getTotalPages,
    getVisibleRange: pagination.getVisibleRange,
    setPage: pagination.setPage,
    setPageSize: pagination.setPageSize,
    setTotalItems: pagination.setTotalItems,
    resetPage: pagination.reset,
    goNext: pagination.goNext,
    goPrev: pagination.goPrev
  }
}

export function useCatalogPagination() {
  return useCatalogPaginationStore(
    useShallow((state) => ({
      page: state.page,
      pageSize: state.pageSize,
      getTotalPages: state.getTotalPages,
      totalItems: state.totalItems,
      getVisibleRange: state.getVisibleRange,
      setPage: state.setPage,
      setPageSize: state.setPageSize,
      setTotalItems: state.setTotalItems,
      reset: state.reset,
      goNext: state.goNext,
      goPrev: state.goPrev
    }))
  )
}

export function useCatalogFilters() {
  return useCatalogViewStore(
    useShallow((state) => ({
      filters: state.filters,
      setFilters: state.setFilters
    }))
  )
}
