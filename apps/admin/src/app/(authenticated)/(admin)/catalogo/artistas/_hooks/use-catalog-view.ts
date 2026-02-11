import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useShallow } from 'zustand/react/shallow'

export function useCatalogView() {
  const store = useCatalogViewStore()

  return {
    // Pagination
    page: store.page,
    totalPages: store.totalPages,
    totalItems: store.totalItems,
    setPage: store.setPage,
    setTotalPages: store.setTotalPages,
    setTotalItems: store.setTotalItems,

    // Filters
    filters: store.filters,
    setFilters: store.setFilters,

    // Drag & Drop
    isDragging: store.isDragging,
    draggedArtistaId: store.draggedArtistaId,
    startDrag: store.startDrag,
    endDrag: store.endDrag,

    // Dialogs
    catalogDialogOpen: store.catalogDialogOpen,
    artistaDialogOpen: store.artistaDialogOpen,
    selectedArtistaId: store.selectedArtistaId,

    openCatalogDialog: store.openCatalogDialog,
    closeCatalogDialog: store.closeCatalogDialog,
    openArtistaDialog: store.openArtistaDialog,
    closeArtistaDialog: store.closeArtistaDialog,
    closeAllDialogs: store.closeAllDialogs
  }
}

export function useCatalogPagination() {
  return useCatalogViewStore(
    useShallow((state) => ({
      page: state.page,
      totalPages: state.totalPages,
      totalItems: state.totalItems,
      setPage: state.setPage
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
