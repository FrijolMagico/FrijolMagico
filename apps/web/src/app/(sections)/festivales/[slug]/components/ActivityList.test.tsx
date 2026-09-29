import { afterEach, describe, expect, jest, test } from 'bun:test'
import { render, screen } from '@testing-library/react'

import { ActivityList } from './ActivityList'

import type { FestivalActivity } from '../../types/festival'

afterEach(() => {
  jest.useRealTimers()
})

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
  test('renders each occurrence as a separate card, including same-day blocks', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-10-03T16:30:00.000Z'))
    const activity = {
      ...makeActivity('Taller', 'taller', [
        { ...occurrence(1, '2026-10-03', '09:00'), registration_url: 'https://example.org/one' },
        { ...occurrence(2, '2026-10-03', '12:00'), registration_url: 'https://example.org/two' },
        { ...occurrence(3, '2026-10-04', '10:00'), registration_url: 'https://example.org/three' }
      ]),
      registration: {
        url: 'https://example.org/legacy',
        start_at: '2026-10-01T00:00:00.000Z',
        end_at: '2026-10-05T00:00:00.000Z'
      }
    }
    const { container } = render(
      <ActivityList actividades={[activity]} isEditionPast={false} />
    )

    expect(container.querySelectorAll('article')).toHaveLength(3)
    expect(
      container.querySelectorAll('section[aria-label^="Actividades del"] > h3')
    ).toHaveLength(2)
    expect(screen.getAllByText('Taller')).toHaveLength(3)
    expect(screen.getByText('09:00hrs a 10:00hrs')).toBeDefined()
    expect(screen.getByText('12:00hrs a 13:00hrs')).toBeDefined()
    expect(screen.getByText('10:00hrs a 11:00hrs')).toBeDefined()
    expect(
      Array.from(container.querySelectorAll('a')).map((link) => link.getAttribute('href'))
    ).toEqual([
      'https://example.org/one',
      'https://example.org/two',
      'https://example.org/three'
    ])
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
