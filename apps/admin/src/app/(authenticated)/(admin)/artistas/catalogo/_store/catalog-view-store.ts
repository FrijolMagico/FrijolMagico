import { create } from 'zustand'
import { CatalogFilters } from '../_types'
import { useCatalogPaginationStore } from './catalog-pagination-store'

interface CatalogViewState {
  // Filters
  filters: CatalogFilters

  // Drag & Drop UI State
  isDragging: boolean
  draggedArtistId: string | null

  // Dialog UI State
  catalogDialogOpen: boolean
  artistDialogOpen: boolean
  selectedArtistId: string | null

  // Actions
  setFilters: (filters: Partial<CatalogFilters>) => void

  startDrag: (catalogId: string) => void
  endDrag: () => void

  openCatalogDialog: (catalogId: string) => void
  closeCatalogDialog: () => void

  openArtistDialog: () => void
  closeArtistDialog: () => void

  closeAllDialogs: () => void
}

// TODO: Consider  split into specific stores if its better, eg. FiltersStore, DragDropStire, DialogStores, etc. (Like the paginationStore one)
export const useCatalogViewStore = create<CatalogViewState>((set) => ({
  filters: { activo: null, destacado: null, search: '' },

  isDragging: false,
  draggedArtistId: null,

  catalogDialogOpen: false,
  artistDialogOpen: false,
  selectedArtistId: null,

  setFilters: (filters) => {
    useCatalogPaginationStore.getState().reset()
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  startDrag: (catalogId) =>
    set({ isDragging: true, draggedArtistId: catalogId }),
  endDrag: () => set({ isDragging: false, draggedArtistId: null }),

  openCatalogDialog: (catalogId) =>
    set({
      catalogDialogOpen: true,
      selectedArtistId: catalogId
    }),
  closeCatalogDialog: () =>
    set({
      catalogDialogOpen: false,
      selectedArtistId: null
    }),

  openArtistDialog: () => set({ artistDialogOpen: true }),
  closeArtistDialog: () => set({ artistDialogOpen: false }),

  closeAllDialogs: () =>
    set({
      catalogDialogOpen: false,
      artistDialogOpen: false,
      selectedArtistId: null
    })
}))
