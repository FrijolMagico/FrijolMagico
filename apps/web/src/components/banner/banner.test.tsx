import { afterEach, describe, expect, mock, test } from 'bun:test'
import { isValidElement } from 'react'

const activeFestivalResult = {
  data: [{ slug: 'festival-xvi' }],
  error: null
}
const getActiveFestivalMock = mock(async () => activeFestivalResult)
const ActiveFestivalBannerMock = (props: { festivalSlug: string }) => props
const FissureBannerMock = (props: Record<string, unknown>) => props
const PodcastBannerMock = () => null

mock.module('@/data/data-access-layer/festivals/getActiveFestival', () => ({
  getActiveFestival: getActiveFestivalMock
}))
mock.module('./ActiveFestivalBanner', () => ({
  ActiveFestivalBanner: ActiveFestivalBannerMock
}))
mock.module('./FissureBanner', () => ({ FissureBanner: FissureBannerMock }))
mock.module('./PodcastBanner', () => ({ PodcastBanner: PodcastBannerMock }))

const { Banner } = await import('./banner')

afterEach(() => {
  getActiveFestivalMock.mockReset()
  getActiveFestivalMock.mockResolvedValue(activeFestivalResult)
})

describe('Banner selection and sizing', () => {
  test('resolves active festival once and applies its legacy sizing around matching content', async () => {
    const rendered = await Banner()

    expect(getActiveFestivalMock).toHaveBeenCalledTimes(1)
    expect(isValidElement(rendered)).toBe(true)
    expect(rendered).toMatchObject({
      type: FissureBannerMock,
      props: {
        landscape: { sizing: 'fixed', height: 640 },
        compact: { sizing: 'square' }
      }
    })
    expect(isValidElement(rendered.props.children)).toBe(true)
    expect(rendered.props.children.type).toBe(ActiveFestivalBannerMock)
    expect(rendered.props.children.props).toEqual({ festivalSlug: 'festival-xvi' })
  })

  test('uses explicit 420/360 fixed podcast frames when no festival is active', async () => {
    getActiveFestivalMock.mockResolvedValue({ data: [], error: null })

    const rendered = await Banner()

    expect(getActiveFestivalMock).toHaveBeenCalledTimes(1)
    expect(rendered).toMatchObject({
      type: FissureBannerMock,
      props: {
        landscape: { sizing: 'fixed', height: 420 },
        compact: { sizing: 'fixed', height: 360 }
      }
    })
    expect(isValidElement(rendered.props.children)).toBe(true)
    expect(rendered.props.children.type).toBe(PodcastBannerMock)
  })
})
