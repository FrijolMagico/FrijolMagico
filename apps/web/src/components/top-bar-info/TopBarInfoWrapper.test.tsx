import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'

const getActiveFestivalDisplay = mock(async () => null as {
  id: number
  slug: string
  event_name: string
  edition_number: string
  start_date: string
  end_date: string
  days: { fecha: string; lugar: string | null }[]
} | null)

mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))
mock.module('next/cache', () => ({
  cacheLife: mock(() => {}),
  cacheTag: mock(() => {})
}))
mock.module('@/data/data-access-layer/festivals/getActiveFestivalDisplay', () => ({
  getActiveFestivalDisplay
}))

afterEach(cleanup)
beforeEach(() => getActiveFestivalDisplay.mockReset())

describe('TopBarInfoWrapper', () => {
  test('renders the active festival display and its days', async () => {
    getActiveFestivalDisplay.mockResolvedValueOnce({
      id: 10,
      slug: 'edicion-15-1',
      event_name: 'Festival Frijol Mágico',
      edition_number: 'XV',
      start_date: '2026-10-09',
      end_date: '2026-10-11',
      days: [
        { fecha: '2026-10-09', lugar: 'Mall VIVO Coquimbo' },
        { fecha: '2026-10-10', lugar: 'Mall VIVO Coquimbo' }
      ]
    })

    const { TopBarInfoWrapper } = await import('./TopBarInfoWrapper')
    const { container } = render(await TopBarInfoWrapper())
    expect(container.querySelector('section')?.textContent).toContain('Festival Frijol Mágico')
    expect(container.querySelector('section')?.textContent).toContain('Mall VIVO Coquimbo')
  })

  test('keeps static site data when there is no active festival', async () => {
    getActiveFestivalDisplay.mockResolvedValueOnce(null)
    const { TopBarInfoWrapper } = await import('./TopBarInfoWrapper')
    const { container } = render(await TopBarInfoWrapper())
    expect(container.querySelector('section')).not.toBeNull()
  })

  test('uses the start-date fallback when an active edition has no days', async () => {
    getActiveFestivalDisplay.mockResolvedValueOnce({
      id: 10,
      slug: 'edicion-15-1',
      event_name: 'Festival Frijol Mágico',
      edition_number: 'XV',
      start_date: '2026-10-09',
      end_date: '2026-10-09',
      days: []
    })
    const { TopBarInfoWrapper } = await import('./TopBarInfoWrapper')
    const { container } = render(await TopBarInfoWrapper())
    expect(container.querySelector('section')?.textContent).toContain('9 de octubre')
  })
})
