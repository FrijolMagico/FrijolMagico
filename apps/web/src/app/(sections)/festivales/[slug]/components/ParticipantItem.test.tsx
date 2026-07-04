import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'

import { ParticipantItem } from './ParticipantItem'

afterEach(cleanup)

mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

describe('ParticipantItem', () => {
  test('renders link for catalog participants', () => {
    render(
      <ParticipantItem
        pseudonimo='Artista Ejemplo'
        catalogoSlug='artista-ejemplo'
      />
    )

    const link = screen.getByRole('link', { name: 'Artista Ejemplo' })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/catalogo/artista-ejemplo')
  })

  test('renders plain text for non-catalog participants', () => {
    render(<ParticipantItem pseudonimo='Colectivo X' catalogoSlug={null} />)

    expect(screen.getByText('Colectivo X')).toBeDefined()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
