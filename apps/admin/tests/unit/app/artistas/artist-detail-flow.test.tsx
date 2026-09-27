import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { ARTIST_STATUS } from '@/core/artistas/_constants'
import type { ArtistWithHistory } from '@/core/artistas/_types/artist'
import type { ArtistDetail } from '@/core/artistas/_types/artist-detail'

let rowActions: Array<{ label: string; onClick: () => void }> = []
mock.module('@/shared/components/action-menu-button', () => ({
  ActionMenuButton: ({ actions }: { actions: typeof rowActions }) => {
    rowActions = actions
    return null
  }
}))
const requests: Array<{ id: number; resolve: (value: ArtistDetail) => void; reject: (error: Error) => void }> = []
mock.module('@/core/artistas/_actions/get-artist-detail.action', () => ({
  getArtistDetailAction: (id: number) => new Promise<ArtistDetail>((resolve, reject) => {
    requests.push({ id, resolve, reject })
  })
}))

const { useArtistDialog } = await import('@/core/artistas/_store/artist-dialog-store')
const { ArtistListRow } = await import('@/core/artistas/_components/artist-list-row')

const artist: ArtistWithHistory = {
  id: 1, pseudonimo: 'Ana Luna', nombre: 'Ana', rut: null, telefono: null,
  correo: null, ciudad: null, pais: null, estadoId: ARTIST_STATUS.ACTIVE,
  rrss: {}, deletedAt: null,
  history: { pseudonimos: [], correos: [], ciudades: [], paises: [], rrss: {} }
}
const emptyDetail: ArtistDetail = { images: [], activities: [], exhibitions: [], activityCount: 0, exhibitionCount: 0 }

describe('artist CV flow', () => {
  beforeEach(() => {
    useArtistDialog.getState().closeArtistDetailDialog()
    requests.length = 0
  })

  test('opens with the entire row artist, fetches only detail, and exposes CV as the first action', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server')
    renderToStaticMarkup(<ArtistListRow artist={artist} isDeletedView={false} onDelete={() => {}} onRestore={() => {}} />)
    expect(rowActions[0].label).toBe('Ficha de artista')
    rowActions[0].onClick()
    expect(useArtistDialog.getState()).toMatchObject({ selectedDetailArtist: artist, isArtistDetailOpen: true, isDetailLoading: true })
    await Bun.sleep(10)
    expect(requests.map((request) => request.id)).toEqual([1])
    requests[0].resolve(emptyDetail)
    await Bun.sleep(0)
    expect(useArtistDialog.getState()).toMatchObject({ artistDetail: emptyDetail, isDetailLoading: false })
  })

  test('ignores late success and failure after switching artists or closing', async () => {
    const first = useArtistDialog.getState().openArtistDetailDialog(artist)
    const second = useArtistDialog.getState().openArtistDetailDialog({ ...artist, id: 2, pseudonimo: 'Sol' })
    await Bun.sleep(10)
    requests[1].resolve(emptyDetail)
    await second
    requests[0].reject(new Error('old request'))
    await first
    expect(useArtistDialog.getState()).toMatchObject({ selectedDetailArtist: { id: 2 }, artistDetail: emptyDetail, detailError: null })
    const third = useArtistDialog.getState().openArtistDetailDialog(artist)
    await Bun.sleep(10)
    useArtistDialog.getState().closeArtistDetailDialog()
    requests[2].resolve(emptyDetail)
    await third
    expect(useArtistDialog.getState()).toMatchObject({ selectedDetailArtist: null, artistDetail: null, isArtistDetailOpen: false })
  })

  test('reports a current request error without discarding the passed profile', async () => {
    const opening = useArtistDialog.getState().openArtistDetailDialog(artist)
    await Bun.sleep(10)
    requests[0].reject(new Error('offline'))
    await opening
    expect(useArtistDialog.getState()).toMatchObject({ selectedDetailArtist: artist, artistDetail: null, isDetailLoading: false, detailError: 'No se pudo cargar el detalle del artista.' })
  })
})
