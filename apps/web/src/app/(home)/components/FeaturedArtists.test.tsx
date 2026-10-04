import { afterEach, describe, expect, mock, test } from 'bun:test'
import { isValidElement } from 'react'

const featuredArtist = {
  pseudonimo: 'Canela',
  slug: 'canela',
  rrss: 'https://instagram.com/canela',
  imagen_url: '/canela.png'
}
const getFeaturedArtistsMock = mock(async () => [featuredArtist])
const ArtistCardMock = () => null

mock.module('@/components/ArtistCard', () => ({ ArtistCard: ArtistCardMock }))
mock.module('@/data/data-access-layer/featured-artists/getFeaturedArtists', () => ({
  getFeaturedArtists: getFeaturedArtistsMock
}))

const { FeaturedArtists } = await import('./FeaturedArtists')

afterEach(() => {
  getFeaturedArtistsMock.mockReset()
  getFeaturedArtistsMock.mockResolvedValue([featuredArtist])
})

describe('FeaturedArtists', () => {
  test('renders each artist with the featured ArtistCard presentation', async () => {
    const rendered = await FeaturedArtists()

    expect(Array.isArray(rendered)).toBe(true)
    expect(rendered).toHaveLength(1)
    expect(isValidElement(rendered[0])).toBe(true)
    expect(rendered[0]).toMatchObject({
      type: ArtistCardMock,
      key: 'canela',
      props: { artist: featuredArtist, isFeatured: true }
    })
  })

  test('does not render an empty-state message for an empty list', async () => {
    getFeaturedArtistsMock.mockResolvedValue([])

    expect(await FeaturedArtists()).toEqual([])
  })

  test('propagates data errors rather than replacing them with empty content', async () => {
    const error = new Error('featured artists unavailable')
    getFeaturedArtistsMock.mockRejectedValue(error)

    await expect(FeaturedArtists()).rejects.toBe(error)
  })
})
