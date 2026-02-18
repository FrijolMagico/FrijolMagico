import { create } from 'zustand'
import { CatalogFilters } from '../_types'
import { useCatalogPaginationStore } from './catalog-pagination-store'

interface CatalogViewState {
  // Filters
  filters: CatalogFilters

  // Drag & Drop UI State
  isDragging: boolean
  draggedArtistId: number | null

  // Dialog UI State
  catalogDialogOpen: boolean
  artistDialogOpen: boolean
  selectedArtistId: number | null

  // Actions
  setFilters: (filters: Partial<CatalogFilters>) => void

  startDrag: (artistId: number) => void
  endDrag: () => void

  openCatalogDialog: (artistId: number) => void
  closeCatalogDialog: () => void

  openArtistDialog: () => void
  closeArtistDialog: () => void

  closeAllDialogs: () => void
}

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

  startDrag: (artistId) => set({ isDragging: true, draggedArtistId: artistId }),
  endDrag: () => set({ isDragging: false, draggedArtistId: null }),

  openCatalogDialog: (artistId) =>
    set({
      catalogDialogOpen: true,
      selectedArtistId: artistId
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
