import { create } from 'zustand'

interface CatalogViewState {
  // Drag & Drop UI State
  isDragging: boolean
  draggedArtistId: string | null

  // Dialog UI State
  catalogDialogOpen: boolean
  artistDialogOpen: boolean
  addCatalogDialogOpen: boolean
  selectedCatalogId: string | null

  // Actions
  startDrag: (catalogId: string) => void
  endDrag: () => void

  openCatalogDialog: (catalogId: string) => void
  closeCatalogDialog: () => void

  openArtistDialog: () => void
  closeArtistDialog: () => void

  openAddCatalogDialog: () => void
  closeAddCatalogDialog: () => void

  closeAllDialogs: () => void
}

// TODO: Consider  split into specific stores if its better, eg. FiltersStore, DragDropStire, DialogStores, etc. (Like the paginationStore one)
export const useCatalogViewStore = create<CatalogViewState>((set) => ({
  isDragging: false,
  draggedArtistId: null,

  catalogDialogOpen: false,
  artistDialogOpen: false,
  addCatalogDialogOpen: false,
  selectedCatalogId: null,

  startDrag: (catalogId) =>
    set({ isDragging: true, draggedArtistId: catalogId }),
  endDrag: () => set({ isDragging: false, draggedArtistId: null }),

  openCatalogDialog: (catalogId) =>
    set({
      catalogDialogOpen: true,
      selectedCatalogId: catalogId
    }),
  closeCatalogDialog: () =>
    set({
      catalogDialogOpen: false,
      selectedCatalogId: null
    }),

  openArtistDialog: () => set({ artistDialogOpen: true }),
  closeArtistDialog: () => set({ artistDialogOpen: false }),

  openAddCatalogDialog: () => set({ addCatalogDialogOpen: true }),
  closeAddCatalogDialog: () => set({ addCatalogDialogOpen: false }),

  closeAllDialogs: () =>
    set({
      catalogDialogOpen: false,
      artistDialogOpen: false,
      addCatalogDialogOpen: false,
      selectedCatalogId: null
    })
}))
