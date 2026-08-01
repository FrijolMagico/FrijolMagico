import { create } from 'zustand'
import type { Catalog } from '../_schemas/catalog.schema'
import type { CatalogArtist } from '../_types/catalog-list-item'

interface CatalogDialogState {
  isUpdateCatalogOpen: boolean
  isCreateCatalogOpen: boolean

  selectedCatalog: Catalog | null
  selectedArtist: CatalogArtist | null

  openUpdateCatalogDialog: (catalog: Catalog, artist: CatalogArtist) => void
  closeUpdateCatalogDialog: () => void

  toggleCreateCatalogDialog: (open: boolean) => void
}

export const useCatalogDialog = create<CatalogDialogState>((set) => ({
  isUpdateCatalogOpen: false,
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

  toggleCreateCatalogDialog: (open) => set({ isCreateCatalogOpen: open })
}))
