import { create } from 'zustand'

interface ArtistListViewState {
  search: string
  setSearch: (search: string) => void
  resetFilters: () => void
}

export const useArtistListViewStore = create<ArtistListViewState>((set) => ({
  search: '',
  setSearch: (search) => set({ search }),
  resetFilters: () => set({ search: '' })
}))
