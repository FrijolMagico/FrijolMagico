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

  test('sorts pseudonyms within each discipline without mutating participants', () => {
    const participants = [
      { pseudonimo: 'ñandú', disciplina_slug: 'Ilustración', catalogo_slug: null, rrss: null },
      { pseudonimo: 'Zeta', disciplina_slug: 'Cerámica', catalogo_slug: null, rrss: null },
      { pseudonimo: 'Águila', disciplina_slug: 'Ilustración', catalogo_slug: null, rrss: null },
      { pseudonimo: 'Naranja', disciplina_slug: 'Ilustración', catalogo_slug: null, rrss: null },
      { pseudonimo: 'árbol', disciplina_slug: 'Cerámica', catalogo_slug: null, rrss: null },
      { pseudonimo: 'aguila', disciplina_slug: 'Ilustración', catalogo_slug: null, rrss: null }
    ]
    const originalParticipants = [...participants]

    render(<ParticipantList participantes={participants} />)

    const getRenderedParticipants = (discipline: string) => {
      const heading = screen.getByRole('heading', { name: discipline })
      const section = heading.closest('section')

      return Array.from(section?.querySelectorAll('li') ?? []).map((item) =>
        item.textContent?.trim()
      )
    }

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    ).toEqual(['Ilustración', 'Cerámica'])
    expect(getRenderedParticipants('Ilustración')).toEqual([
      'Águila',
      'aguila',
      'Naranja',
      'ñandú'
    ])
    expect(getRenderedParticipants('Cerámica')).toEqual(['árbol', 'Zeta'])
    expect(participants).toEqual(originalParticipants)
  })

  test('renders empty message when no participants', () => {
    render(<ParticipantList participantes={[]} />)

    expect(screen.getByText('Sin participantes registrados aún')).toBeDefined()
  })
})
