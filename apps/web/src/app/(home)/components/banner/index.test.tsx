import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'

const getActiveFestivalDisplay = mock(async () => null as { slug: string } | null)
mock.module('@/data/data-access-layer/festivals/getActiveFestivalDisplay', () => ({
  getActiveFestivalDisplay
}))
afterEach(cleanup)
beforeEach(() => getActiveFestivalDisplay.mockReset())

describe('Banner', () => {
  test('renders the active festival banner', async () => {
    getActiveFestivalDisplay.mockResolvedValueOnce({ slug: 'festival-actual' })
    const { Banner } = await import('./index')
    const { container } = render(await Banner())
    expect(container.textContent).not.toContain('Podcast')
    expect(container.querySelector('a[href*="festival-actual"]')).not.toBeNull()
  })

  test('keeps the podcast fallback without an active festival', async () => {
    getActiveFestivalDisplay.mockResolvedValueOnce(null)
    const { Banner } = await import('./index')
    const { container } = render(await Banner())
    expect(container.firstChild).not.toBeNull()
  })
})
