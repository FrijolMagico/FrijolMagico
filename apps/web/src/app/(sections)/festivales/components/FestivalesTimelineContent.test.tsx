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

const trailingFestival = {
  ...mockFestivales[0]!,
  evento: {
    ...mockFestivales[0]!.evento,
    evento_id: 3,
    edicion: 'IV',
    edicion_slug: 'edicion-iv-3'
  }
}

describe('FestivalesTimelineContent', () => {
  test('renders one card and detail link per festival with unique structural IDs', () => {
    render(<FestivalesTimelineContent festivales={mockFestivales} activeId={null} />)

    const articles = screen.getAllByRole('article')
    const links = screen.getAllByRole('link')
    const ids = articles.map((article) => article.id)
    const festivalIds = articles.map((article) =>
      article.getAttribute('data-festival-id')
    )

    expect(articles).toHaveLength(mockFestivales.length)
    expect(links).toHaveLength(mockFestivales.length)
    expect(ids).toEqual(['festival-1-XV', 'festival-2-3'])
    expect(festivalIds).toEqual(ids)
    expect(new Set(ids).size).toBe(ids.length)
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/festivales/edicion-xv-1',
      '/festivales/edicion-3-2'
    ])
  })

  test('alternates desktop card placement and connector direction', () => {
    render(
      <FestivalesTimelineContent
        festivales={[...mockFestivales, trailingFestival]}
        activeId={null}
      />
    )

    const firstSection = screen.getByRole('region', {
      name: 'Festival Frijol Mágico - Edición XV'
    })
    const secondSection = screen.getByRole('region', {
      name: 'Ilustradores en Benders - Edición 3'
    })
    const finalSection = screen.getByRole('region', {
      name: 'Festival Frijol Mágico - Edición IV'
    })
    const firstCardWrapper = firstSection.querySelector('[data-card-placement]')
    const secondCardWrapper = secondSection.querySelector('[data-card-placement]')
    const firstConnector = firstSection.querySelector('[data-connector-placement]')
    const secondConnector = secondSection.querySelector(
      '[data-connector-placement]'
    )

    expect(firstCardWrapper?.getAttribute('data-card-placement')).toBe('left')
    expect(secondCardWrapper?.getAttribute('data-card-placement')).toBe('right')
    expect(firstConnector?.getAttribute('data-connector-placement')).toBe('right')
    expect(secondConnector?.getAttribute('data-connector-placement')).toBe('left')
    expect(firstConnector?.firstElementChild?.className).toContain('-translate-x-8')
    expect(secondConnector?.firstElementChild?.className).toContain('translate-x-8')
    expect(firstConnector?.querySelector('path')?.getAttribute('class')).toBe(
      'stroke-secondary'
    )
    expect(secondConnector?.querySelector('path')?.getAttribute('class')).toBe(
      'stroke-primary'
    )
    expect(finalSection.querySelector('[data-connector-placement]')).toBeNull()
  })

  test('shows the empty state without timeline cards', () => {
    render(<FestivalesTimelineContent festivales={[]} activeId={null} />)

    expect(screen.getByText('No hay festivales para mostrar.')).toBeTruthy()
    expect(screen.queryByRole('article')).toBeNull()
  })

  test('marks only the active festival backlight as fully visible', () => {
    render(
      <FestivalesTimelineContent
        festivales={mockFestivales}
        activeId='festival-2-3'
      />
    )

    const articles = screen.getAllByRole('article')
    const firstBacklight = articles[0]?.nextElementSibling
    const secondBacklight = articles[1]?.nextElementSibling

    expect(firstBacklight?.className).toContain('opacity-30')
    expect(secondBacklight?.className).toContain('opacity-100')
  })
})
