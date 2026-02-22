import { create } from 'zustand'

interface ArtistListViewState {
  editDialogOpen: boolean
  selectedArtistId: string | null
  historyDialogOpen: boolean
  selectedHistoryArtistId: string | null

  openEditDialog: (id: string) => void
  closeEditDialog: () => void
  openHistoryDialog: (id: string) => void
  closeHistoryDialog: () => void
}

export const useArtistListViewStore = create<ArtistListViewState>((set) => ({
  editDialogOpen: false,
  selectedArtistId: null,
  historyDialogOpen: false,
  selectedHistoryArtistId: null,

  openEditDialog: (id) => set({ editDialogOpen: true, selectedArtistId: id }),
  closeEditDialog: () => set({ editDialogOpen: false, selectedArtistId: null }),
  openHistoryDialog: (id) => set({ historyDialogOpen: true, selectedHistoryArtistId: id }),
  closeHistoryDialog: () => set({ historyDialogOpen: false, selectedHistoryArtistId: null })
}))
