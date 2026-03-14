import { create } from 'zustand'
import { Catalog } from '../_schemas/catalogo.schema'
import { Artist } from '../../_schemas/artista.schema'

interface CatalogDialogState {
  // Dialog UI State
  isUpdateCatalogOpen: boolean
  isUpdateArtistOpen: boolean
  isCreateCatalogOpen: boolean

  selectedCatalog: Catalog | null
  selectedArtist: Artist | null

  openUpdateCatalogDialog: (catalog: Catalog, artist: Artist) => void
  closeUpdateCatalogDialog: () => void

  openUpdateArtistDialog: () => void
  closeUpdateArtistDialog: () => void

  openCreateCatalogDialog: () => void
  closeCreateCatalogDialog: () => void
}

// TODO: Consider  split into specific stores if its better, eg. FiltersStore, DragDropStire, DialogStores, etc. (Like the paginationStore one)
export const useCatalogDialog = create<CatalogDialogState>((set) => ({
  isUpdateCatalogOpen: false,
  isUpdateArtistOpen: false,
  isCreateCatalogOpen: false,

  selectedCatalog: null,
  selectedArtist: null,

  openUpdateCatalogDialog: (catalog, artist) =>
    set({
      isUpdateCatalogOpen: true,
      selectedCatalog: catalog,
      selectedArtist: artist
    }),
  closeUpdateCatalogDialog: () =>
    set({
      isUpdateCatalogOpen: false,
      selectedCatalog: null,
      selectedArtist: null
    }),

  openUpdateArtistDialog: () => set({ isUpdateArtistOpen: true }),
  closeUpdateArtistDialog: () => set({ isUpdateArtistOpen: false }),

  openCreateCatalogDialog: () => set({ isCreateCatalogOpen: true }),
  closeCreateCatalogDialog: () => set({ isCreateCatalogOpen: false })
}))
