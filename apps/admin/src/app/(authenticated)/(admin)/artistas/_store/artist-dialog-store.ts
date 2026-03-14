import { create } from 'zustand'
import { DomainArtist } from '../_types/artist'
import { History } from '../_lib/aggregate-history'
import { Artist } from '../_schemas/artista.schema'

interface ArtistDialogStore {
  addDialogOpen: boolean
  editDialogOpen: boolean
  historyDialogOpen: boolean

  selectedArtistData: Artist | null
  selectedArtistHistory: (History & Pick<DomainArtist, 'pseudonimo'>) | null

  openAddDialog: () => void
  closeAddDialog: () => void
  openEditDialog: (artist: Artist) => void
  closeEditDialog: () => void
  openHistoryDialog: (
    history: History,
    artist: Pick<DomainArtist, 'pseudonimo'>
  ) => void
  closeHistoryDialog: () => void
}

export const useArtistDialog = create<ArtistDialogStore>((set) => ({
  addDialogOpen: false,
  editDialogOpen: false,
  historyDialogOpen: false,
  selectedArtistData: null,
  selectedArtistHistory: null,

  openAddDialog: () => set({ addDialogOpen: true }),
  closeAddDialog: () => set({ addDialogOpen: false }),
  openEditDialog: (artist) =>
    set({
      editDialogOpen: true,
      selectedArtistData: artist
    }),
  closeEditDialog: () =>
    set({
      editDialogOpen: false,
      selectedArtistData: null
    }),
  openHistoryDialog: (history, artist) =>
    set({
      historyDialogOpen: true,
      selectedArtistHistory: {
        ...history,
        pseudonimo: artist.pseudonimo
      }
    }),
  closeHistoryDialog: () =>
    set({ historyDialogOpen: false, selectedArtistHistory: null })
}))
