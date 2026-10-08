import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'

import { ParticipantByDiscipline } from './ParticipantByDiscipline'

afterEach(cleanup)

mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

describe('ParticipantByDiscipline', () => {
  test('renders discipline heading and participant items', () => {
    render(
      <ParticipantByDiscipline
        disciplineLabel='Ilustración'
        participants={[
          { pseudonimo: 'Artista A', disciplina_slug: 'Ilustración', catalogo_slug: 'a', rrss: null },
          { pseudonimo: 'Artista B', disciplina_slug: 'Ilustración', catalogo_slug: null, rrss: null }
        ]}
      />
    )

    expect(screen.getByRole('heading', { name: 'Ilustración' })).toBeDefined()
    expect(screen.getByText('Artista A')).toBeDefined()
    expect(screen.getByText('Artista B')).toBeDefined()
    const list = screen.getByRole('list')
    const items = screen.getAllByRole('listitem')
    const separator = items[0].querySelector('span[aria-hidden="true"]')
    expect(list.className).toContain('flex-wrap')
    expect(list.className).toContain('justify-center')
    expect(list.className).toContain('md:justify-start')
    expect(list.className).not.toContain('columns-')
    expect(separator?.className).toContain('rounded-full')
    expect(items[1].querySelector('span[aria-hidden="true"]')).toBeNull()
  })
})
