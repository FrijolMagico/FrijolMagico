import { create } from 'zustand'

interface CatalogPanelState {
  isArtistPanelOpen: boolean
  setArtistPanelOpen: (open: boolean) => void
}

export const useCatalogPanelStore = create<CatalogPanelState>((set) => ({
  isArtistPanelOpen: false,
  setArtistPanelOpen: (open) => set({ isArtistPanelOpen: open })
}))
