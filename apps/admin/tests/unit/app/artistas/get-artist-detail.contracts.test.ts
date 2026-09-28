import { describe, expect, mock, test } from 'bun:test'

const requireAuth = mock(async () => {})
const emptyDetail = {
  images: [],
  activities: [],
  exhibitions: [],
  activityCount: 0,
  exhibitionCount: 0
}
const getArtistDetail = mock(async (_id: number) => emptyDetail)
mock.module('server-only', () => ({}))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/core/artistas/_lib/get-artist-detail', () => ({ getArtistDetail }))

const { getArtistDetailAction } =
  await import('@/core/artistas/_actions/get-artist-detail.action')

describe('artist detail action boundary', () => {
  test('requires authentication before fetching', async () => {
    requireAuth.mockClear()
    getArtistDetail.mockClear()
    await expect(getArtistDetailAction(3)).resolves.toEqual(emptyDetail)
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(getArtistDetail).toHaveBeenCalledWith(3)
  })

  test('rejects invalid IDs without reaching the DAL', async () => {
    getArtistDetail.mockClear()
    await expect(getArtistDetailAction(-1)).rejects.toThrow()
    await expect(getArtistDetailAction(1.5)).rejects.toThrow()
    expect(getArtistDetail).not.toHaveBeenCalled()
  })

  test('does not fetch when authentication fails', async () => {
    getArtistDetail.mockClear()
    requireAuth.mockRejectedValueOnce(new Error('Unauthorized'))
    await expect(getArtistDetailAction(2)).rejects.toThrow('Unauthorized')
    expect(getArtistDetail).not.toHaveBeenCalled()
  })
})
