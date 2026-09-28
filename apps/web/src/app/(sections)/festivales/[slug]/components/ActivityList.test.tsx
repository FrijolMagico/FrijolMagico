import { describe, expect, test } from 'bun:test'
import { render, screen } from '@testing-library/react'

import { ActivityList } from './ActivityList'

import type { FestivalActivity } from '../../types/festival'

const makeActivity = (
  title: string,
  type: string,
  occurrences: FestivalActivity['ocurrencias']
): FestivalActivity => ({
  titulo: title,
  descripcion: null,
  ubicacion: null,
  ocurrencias: occurrences,
  tipo: type,
  participante_pseudonimo: null,
  registration: null
})

const occurrence = (
  id: number,
  date: string,
  time: string | null = '10:00'
): FestivalActivity['ocurrencias'][number] => ({
  id,
  fecha: date,
  hora_inicio: time,
  duracion_minutos: time ? 60 : null,
  registration_url: null
})

describe('ActivityList', () => {
  test('renders one activity card per distinct day and keeps same-day blocks together', () => {
    const activity = makeActivity('Taller', 'taller', [
      occurrence(1, '2026-10-03', '09:00'),
      occurrence(2, '2026-10-03', '12:00'),
      occurrence(3, '2026-10-04', '10:00')
    ])
    const { container } = render(
      <ActivityList actividades={[activity]} isEditionPast={false} />
    )

    expect(container.querySelectorAll('article')).toHaveLength(2)
    expect(
      container.querySelectorAll('section[aria-label^="Actividades del"] > h3')
    ).toHaveLength(2)
    expect(screen.getAllByText('Taller')).toHaveLength(2)
    expect(screen.getByText('Bloque 1: 09:00hrs a 10:00hrs')).toBeDefined()
    expect(screen.getByText('Bloque 2: 12:00hrs a 13:00hrs')).toBeDefined()
    expect(container.textContent).not.toContain('2026-10-03')
    expect(container.textContent).not.toContain('2026-10-04')
  })

  test('retains type subgroups within each day and places music last without registration CTA', () => {
    const date = '2026-10-03'
    const { container } = render(
      <ActivityList
        actividades={[
          makeActivity('Charla', 'charla', [occurrence(1, date)]),
          {
            ...makeActivity('Música', 'musica', [occurrence(2, date, '19:00')]),
            registration: {
              url: 'https://example.org/register',
              start_at: '2026-10-01T00:00:00.000Z',
              end_at: '2026-10-05T00:00:00.000Z'
            }
          },
          makeActivity('Taller', 'taller', [occurrence(3, date)])
        ]}
        isEditionPast={false}
      />
    )

    const typeHeadings = screen.getAllByRole('heading', { level: 4 })
    expect(typeHeadings.map((heading) => heading.textContent)).toEqual([
      'Talleres',
      'Charlas',
      'Música'
    ])
    expect(container.querySelectorAll('article')).toHaveLength(3)
    expect(screen.getByText('19:00hrs a 20:00hrs')).toBeDefined()
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })

  test('keeps separate activities distinct and hides undated legacy activities', () => {
    const { container } = render(
      <ActivityList
        actividades={[
          makeActivity('Duplicado', 'taller', [occurrence(1, '2026-10-03')]),
          makeActivity('Duplicado', 'taller', [occurrence(2, '2026-10-03')]),
          makeActivity('Legacy', 'charla', [])
        ]}
        isEditionPast={false}
      />
    )
    expect(container.querySelectorAll('article')).toHaveLength(2)
    expect(screen.getAllByText('Duplicado')).toHaveLength(2)
    expect(screen.queryByText('Legacy')).toBeNull()
  })

  test('renders only the section heading when no dated activities exist', () => {
    render(<ActivityList actividades={[]} isEditionPast={false} />)
    expect(screen.getByText('Actividades')).toBeDefined()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
