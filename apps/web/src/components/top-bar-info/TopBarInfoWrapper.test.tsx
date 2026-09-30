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
  cacheTag: mock(() => {})
}))

afterEach(cleanup)

beforeEach(() => {
  executeQueryMock.mockReset()
})

describe('TopBarInfoWrapper', () => {
  test('renders static site top-bar information without querying the database', async () => {
    const { TopBarInfoWrapper } = await import('./TopBarInfoWrapper')
    const element = await TopBarInfoWrapper()

    const { container } = render(element)
    expect(container.querySelector('section')).not.toBeNull()
    expect(container.textContent).toContain('Festival Frijol Mágico 2026')
    expect(executeQueryMock).not.toHaveBeenCalled()
  })
})
