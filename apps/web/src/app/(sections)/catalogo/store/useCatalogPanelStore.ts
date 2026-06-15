import { create } from 'zustand'

interface CatalogPanelState {
  isArtistPanelOpen: boolean
  artistSlug: string | null
  setArtistPanelOpen: (open: boolean) => void
  setArtistSlug: (slug: string | null) => void
}

export const useCatalogPanelStore = create<CatalogPanelState>((set) => ({
  isArtistPanelOpen: false,
  artistSlug: null,
  setArtistPanelOpen: (open) => set({ isArtistPanelOpen: open }),
  setArtistSlug: (slug) => set({ artistSlug: slug })
}))
