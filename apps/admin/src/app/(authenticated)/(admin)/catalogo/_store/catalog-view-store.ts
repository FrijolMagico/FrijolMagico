import { create } from 'zustand'
import { CatalogFilters } from '../_types'

interface CatalogViewState {
  // Pagination
  page: number
  pageSize: number
  totalPages: number
  totalItems: number

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
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setTotalPages: (total: number) => void
  setTotalItems: (total: number) => void
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
  page: 1,
  pageSize: 20,
  totalPages: 1,
  totalItems: 0,
  filters: { activo: null, destacado: null, search: '' },

  isDragging: false,
  draggedArtistId: null,

  catalogDialogOpen: false,
  artistDialogOpen: false,
  selectedArtistId: null,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setTotalItems: (totalItems) => set({ totalItems }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1 // Reset to first page on filter change
    })),

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
