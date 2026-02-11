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
  draggedArtistaId: number | null

  // Dialog UI State
  catalogDialogOpen: boolean
  artistaDialogOpen: boolean
  selectedArtistaId: number | null

  // Actions
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setTotalPages: (total: number) => void
  setTotalItems: (total: number) => void
  setFilters: (filters: Partial<CatalogFilters>) => void

  startDrag: (artistaId: number) => void
  endDrag: () => void

  openCatalogDialog: (artistaId: number) => void
  closeCatalogDialog: () => void

  openArtistaDialog: () => void
  closeArtistaDialog: () => void

  closeAllDialogs: () => void
}

export const useCatalogViewStore = create<CatalogViewState>((set) => ({
  page: 1,
  pageSize: 20,
  totalPages: 1,
  totalItems: 0,
  filters: { activo: null, destacado: null, search: '' },

  isDragging: false,
  draggedArtistaId: null,

  catalogDialogOpen: false,
  artistaDialogOpen: false,
  selectedArtistaId: null,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setTotalItems: (totalItems) => set({ totalItems }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1 // Reset to first page on filter change
    })),

  startDrag: (artistaId) =>
    set({ isDragging: true, draggedArtistaId: artistaId }),
  endDrag: () => set({ isDragging: false, draggedArtistaId: null }),

  openCatalogDialog: (artistaId) =>
    set({
      catalogDialogOpen: true,
      selectedArtistaId: artistaId
    }),
  closeCatalogDialog: () =>
    set({
      catalogDialogOpen: false,
      selectedArtistaId: null
    }),

  openArtistaDialog: () => set({ artistaDialogOpen: true }),
  closeArtistaDialog: () => set({ artistaDialogOpen: false }),

  closeAllDialogs: () =>
    set({
      catalogDialogOpen: false,
      artistaDialogOpen: false,
      selectedArtistaId: null
    })
}))
