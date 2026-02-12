import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useShallow } from 'zustand/react/shallow'

export function useCatalogView() {
  return useCatalogViewStore(
    useShallow((store) => ({
      // Pagination
      page: store.page,
      pageSize: store.pageSize,
      totalPages: store.totalPages,
      totalItems: store.totalItems,
      setPage: store.setPage,
      setPageSize: store.setPageSize,
      setTotalPages: store.setTotalPages,
      setTotalItems: store.setTotalItems,

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
}

export function useCatalogPagination() {
  return useCatalogViewStore(
    useShallow((state) => ({
      page: state.page,
      pageSize: state.pageSize,
      totalPages: state.totalPages,
      totalItems: state.totalItems,
      setPage: state.setPage,
      setPageSize: state.setPageSize
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
