import { create } from 'zustand'

interface ArtistDialogStore {
  addDialogOpen: boolean
  editDialogOpen: boolean
  selectedArtistId: string | null
  historyDialogOpen: boolean
  selectedHistoryArtistId: string | null

  openAddDialog: () => void
  closeAddDialog: () => void
  openEditDialog: (id: string) => void
  closeEditDialog: () => void
  openHistoryDialog: (id: string) => void
  closeHistoryDialog: () => void
}

export const useArtistDialog = create<ArtistDialogStore>((set) => ({
  addDialogOpen: false,
  editDialogOpen: false,
  selectedArtistId: null,
  historyDialogOpen: false,
  selectedHistoryArtistId: null,

  openAddDialog: () => set({ addDialogOpen: true }),
  closeAddDialog: () => set({ addDialogOpen: false }),
  openEditDialog: (id) => set({ editDialogOpen: true, selectedArtistId: id }),
  closeEditDialog: () => set({ editDialogOpen: false, selectedArtistId: null }),
  openHistoryDialog: (id) =>
    set({ historyDialogOpen: true, selectedHistoryArtistId: id }),
  closeHistoryDialog: () =>
    set({ historyDialogOpen: false, selectedHistoryArtistId: null })
}))
