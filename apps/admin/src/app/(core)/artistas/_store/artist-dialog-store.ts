import { create } from 'zustand'
import { ArtistWithHistory } from '../_types/artist'
import { History } from '../_lib/aggregate-history'
import { Artist } from '../_schemas/artista.schema'

interface ArtistDialogStore {
  isCreateArtistOpen: boolean
  isUpdateArtistOpen: boolean
  isArtistHistoryOpen: boolean

  selectedArtist: Artist | null
  selectedArtistId: number | null
  selectedArtistHistory:
    | (History & Pick<ArtistWithHistory, 'pseudonimo'>)
    | null

  toggleCreateArtistDialog: (open: boolean) => void
  openUpdateArtistDialog: (artist: Artist) => void
  closeUpdateArtistDialog: () => void
  openArtistHistoryDialog: (
    history: History,
    artist: Pick<ArtistWithHistory, 'pseudonimo'>,
    artistId: number
  ) => void
  closeArtistHistoryDialog: () => void
}

export const useArtistDialog = create<ArtistDialogStore>((set) => ({
  isCreateArtistOpen: false,
  isUpdateArtistOpen: false,
  isArtistHistoryOpen: false,
  selectedArtist: null,
  selectedArtistId: null,
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
  openArtistHistoryDialog: (history, artist, artistId) =>
    set({
      isArtistHistoryOpen: true,
      selectedArtistId: artistId,
      selectedArtistHistory: {
        ...history,
        pseudonimo: artist.pseudonimo
      }
    }),
  closeArtistHistoryDialog: () =>
    set({
      isArtistHistoryOpen: false,
      selectedArtistId: null,
      selectedArtistHistory: null
    })
}))
