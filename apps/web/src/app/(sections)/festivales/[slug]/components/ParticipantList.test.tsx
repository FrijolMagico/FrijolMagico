import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'

import { ParticipantList } from './ParticipantList'

afterEach(cleanup)

mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

describe('ParticipantList', () => {
  test('groups participants by discipline and renders sections', () => {
    render(
      <ParticipantList
        participantes={[
          {
            pseudonimo: 'Artista A',
            disciplina_slug: 'Ilustración',
            catalogo_slug: null,
            rrss: null
          },
          {
            pseudonimo: 'Artista B',
            disciplina_slug: 'Ilustración',
            catalogo_slug: null,
            rrss: null
          },
          {
            pseudonimo: 'Artista C',
            disciplina_slug: 'Manualidades',
            catalogo_slug: null,
            rrss: null
          }
        ]}
      />
    )

    expect(screen.getByRole('heading', { name: 'Ilustración' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Manualidades' })).toBeDefined()
    expect(screen.getByText('Artista A')).toBeDefined()
    expect(screen.getByText('Artista B')).toBeDefined()
    expect(screen.getByText('Artista C')).toBeDefined()
  })

  test('renders empty message when no participants', () => {
    render(<ParticipantList participantes={[]} />)

    expect(screen.getByText('Sin participantes registrados aún')).toBeDefined()
  })
})
