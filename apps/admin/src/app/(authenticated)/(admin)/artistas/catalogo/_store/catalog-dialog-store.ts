import { create } from 'zustand'
import { Catalog } from '../_schemas/catalogo.schema'
import { Artist } from '../../_schemas/artista.schema'

interface CatalogDialogState {
  isUpdateCatalogOpen: boolean
  isCreateCatalogOpen: boolean

  selectedCatalog: Catalog | null
  selectedArtist: Artist | null

  openUpdateCatalogDialog: (catalog: Catalog, artist: Artist) => void
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
