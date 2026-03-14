import { create } from 'zustand'
import { DomainArtist } from '../_types/artist'
import { History } from '../_lib/aggregate-history'
import { Artist } from '../_schemas/artista.schema'

interface ArtistDialogStore {
  isCreateArtistOpen: boolean
  isUpdateArtistOpen: boolean
  isArtistHistoryOpen: boolean

  selectedArtist: Artist | null
  selectedArtistHistory: (History & Pick<DomainArtist, 'pseudonimo'>) | null

  toggleCreateArtistDialog: (open: boolean) => void
  openUpdateArtistDialog: (artist: Artist) => void
  closeUpdateArtistDialog: () => void
  openArtistHistoryDialog: (
    history: History,
    artist: Pick<DomainArtist, 'pseudonimo'>
  ) => void
  closeArtistHistoryDialog: () => void
}

export const useArtistDialog = create<ArtistDialogStore>((set) => ({
  isCreateArtistOpen: false,
  isUpdateArtistOpen: false,
  isArtistHistoryOpen: false,
  selectedArtist: null,
  selectedArtistHistory: null,

  toggleCreateArtistDialog: (open) => set({ isCreateArtistOpen: open }),

  openUpdateArtistDialog: (artist) =>
    set({
      isUpdateArtistOpen: true,
      selectedArtist: artist
    }),
  closeUpdateArtistDialog: () =>
    set({
      isUpdateArtistOpen: false,
      selectedArtist: null
    }),
  openArtistHistoryDialog: (history, artist) =>
    set({
      isArtistHistoryOpen: true,
      selectedArtistHistory: {
        ...history,
        pseudonimo: artist.pseudonimo
      }
    }),
  closeArtistHistoryDialog: () =>
    set({ isArtistHistoryOpen: false, selectedArtistHistory: null })
}))
