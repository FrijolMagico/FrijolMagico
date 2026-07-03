import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'

import { FestivalesTimelineContent } from './FestivalesTimelineContent'

afterEach(cleanup)

mock.module('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} data-testid='card-link' className={className}>
      {children}
    </a>
  )
}))

const mockFestivales = [
  {
    evento: {
      evento_id: 1,
      nombre: 'Festival Frijol Mágico',
      slug: 'frijol-magico',
      edicion: 'XV',
      edicion_nombre: 'Un Nuevo Germinar',
      edicion_slug: 'edicion-xv-1',
      poster_url: null,
      dias: [{ fecha: '2025-10-03', hora_inicio: '11:00', hora_fin: '20:00', modalidad: 'presencial' as const, lugar: null }]
    },
    resumen: {
      total_participantes: { exponentes: 1, talleres: 0, musica: 0 },
      por_disciplina: { ilustracion: 1 }
    }
  },
  {
    evento: {
      evento_id: 2,
      nombre: 'Ilustradores en Benders',
      slug: 'ilustra-benders',
      edicion: '3',
      edicion_nombre: 'Season 3',
      edicion_slug: 'edicion-3-2',
      poster_url: null,
      dias: [{ fecha: '2025-05-10', hora_inicio: '19:00', hora_fin: '23:00', modalidad: 'presencial' as const, lugar: null }]
    },
    resumen: {
      total_participantes: { exponentes: 1, talleres: 0, musica: 0 },
      por_disciplina: { ilustracion: 1 }
    }
  }
]

describe('FestivalesTimelineContent', () => {
  test('wraps each card in a link to the edition detail page', () => {
    render(<FestivalesTimelineContent festivales={mockFestivales} activeId={null} />)

    const links = screen.getAllByTestId('card-link')
    const uniqueHrefs = [...new Set(links.map((link) => link.getAttribute('href')))]

    expect(uniqueHrefs).toContain('/festivales/edicion-xv-1')
    expect(uniqueHrefs).toContain('/festivales/edicion-3-2')
  })

  test('card and link have interactive hover and focus classes', () => {
    render(<FestivalesTimelineContent festivales={mockFestivales} activeId={null} />)

    const articles = screen.getAllByRole('article')
    const firstArticle = articles[0]
    const firstLink = screen.getAllByTestId('card-link')[0]

    expect(firstArticle?.className).toContain('cursor-pointer')
    expect(firstArticle?.className).toContain('hover:scale-[1.01]')
    expect(firstArticle?.className).toContain('hover:shadow-xl')
    expect(firstLink?.className).toContain('focus-visible:ring-2')
  })
})
