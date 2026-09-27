import { create } from 'zustand'
import type { ArtistWithHistory } from '../_types/artist'
import type { ArtistDetail } from '../_types/artist-detail'
import type { History } from '../_lib/aggregate-history'
import type { Artist } from '../_schemas/artista.schema'

interface ArtistDialogStore {
  isCreateArtistOpen: boolean
  isUpdateArtistOpen: boolean
  isArtistHistoryOpen: boolean
  isArtistDetailOpen: boolean
  selectedDetailArtist: ArtistWithHistory | null
  artistDetail: ArtistDetail | null
  isDetailLoading: boolean
  detailError: string | null
  openArtistDetailDialog: (artist: ArtistWithHistory) => Promise<void>
  closeArtistDetailDialog: () => void

  selectedArtist: Artist | null
  selectedArtistId: number | null
  selectedArtistHistory:
    (History & Pick<ArtistWithHistory, 'pseudonimo'>) | null

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

export const useArtistDialog = create<ArtistDialogStore>((set) => {
  let requestId = 0
  return {
    isCreateArtistOpen: false,
    isUpdateArtistOpen: false,
    isArtistHistoryOpen: false,
    isArtistDetailOpen: false,
    selectedDetailArtist: null,
    artistDetail: null,
    isDetailLoading: false,
    detailError: null,
    openArtistDetailDialog: async (artist) => {
      const currentRequest = ++requestId
      set({
        isArtistDetailOpen: true,
        selectedDetailArtist: artist,
        artistDetail: null,
        isDetailLoading: true,
        detailError: null
      })
      try {
        const { getArtistDetailAction } =
          await import('../_actions/get-artist-detail.action')
        const detail = await getArtistDetailAction(artist.id)
        if (currentRequest === requestId)
          set({ artistDetail: detail, isDetailLoading: false })
      } catch {
        if (currentRequest === requestId)
          set({
            isDetailLoading: false,
            detailError: 'No se pudo cargar el detalle del artista.'
          })
      }
    },
    closeArtistDetailDialog: () => {
      requestId++
      set({
        isArtistDetailOpen: false,
        selectedDetailArtist: null,
        artistDetail: null,
        isDetailLoading: false,
        detailError: null
      })
    },
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
  }
})
