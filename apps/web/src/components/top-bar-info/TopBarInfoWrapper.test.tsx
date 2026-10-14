import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'

import { executeQueryMock } from '@/test-utils/mockDatabase'

// Mock next/link for TopBarInfoClient
mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

// Mock next/cache
mock.module('next/cache', () => ({
  cacheLife: mock(() => {}),
  cacheTag: mock(() => {})
}))

const siteDataFixture = {
  top_bar: {
    active: false,
    text: 'Festival de prueba',
    button: { active: false, text: 'Más info', href: '/festivales/prueba' }
  }
}

mock.module('@/data/site.json', () => ({ default: siteDataFixture }))

afterEach(() => {
  cleanup()
  siteDataFixture.top_bar.active = false
})

beforeEach(() => {
  executeQueryMock.mockReset()
})

describe('TopBarInfoWrapper', () => {
  test('renders dynamic data when festival is active', async () => {
    // Mock: active festival + edition days
    executeQueryMock.mockResolvedValueOnce({
      data: [
        {
          id: 10,
          slug: 'edicion-15-1',
          event_name: 'Festival Frijol Mágico',
          edition_number: 'XV',
          start_date: '2026-10-09',
          end_date: '2026-10-11'
        }
      ],
      error: null
    })
    executeQueryMock.mockResolvedValueOnce({
      data: [
        { fecha: '2026-10-09', lugar: 'Mall VIVO Coquimbo' },
        { fecha: '2026-10-10', lugar: 'Mall VIVO Coquimbo' }
      ],
      error: null
    })

    const { TopBarInfoWrapper } = await import('./TopBarInfoWrapper')
    const element = await TopBarInfoWrapper()

    const { container } = render(element)
    const section = container.querySelector('section')
    expect(section).not.toBeNull()
    expect(section!.textContent).toContain('Festival Frijol Mágico')
  })

  test('renders site data when no festival is active and static top bar is enabled', async () => {
    siteDataFixture.top_bar.active = true
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const { TopBarInfoWrapper } = await import('./TopBarInfoWrapper')
    const element = await TopBarInfoWrapper()

    expect(element).not.toBeNull()
    const { container } = render(element)
    expect(container.querySelector('section')?.textContent).toContain('Festival de prueba')
  })

  test('returns null when no festival is active and static top bar is disabled', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const { TopBarInfoWrapper } = await import('./TopBarInfoWrapper')
    const element = await TopBarInfoWrapper()

    expect(element).toBeNull()
  })
})
