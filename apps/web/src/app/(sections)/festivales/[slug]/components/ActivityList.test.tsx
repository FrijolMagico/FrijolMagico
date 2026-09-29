import { afterEach, describe, expect, jest, test } from 'bun:test'
import { fireEvent, render, screen } from '@testing-library/react'

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

    expect(container.querySelectorAll('article')).toHaveLength(2)
    expect(
      container.querySelectorAll('section[aria-label^="Actividades del"] > h3')
    ).toHaveLength(1)
    expect(screen.getAllByText('Taller')).toHaveLength(2)
    expect(screen.getByText('09:00hrs a 10:00hrs')).toBeDefined()
    expect(screen.getByText('12:00hrs a 13:00hrs')).toBeDefined()
    expect(
      Array.from(container.querySelectorAll('a')).map((link) => link.getAttribute('href'))
    ).toEqual(['https://example.org/one', 'https://example.org/two'])
    expect(container.textContent).not.toContain('2026-10-03')
    expect(container.textContent).not.toContain('2026-10-04')

    fireEvent.click(screen.getByRole('button', { name: '4 oct' }))
    expect(container.querySelectorAll('article')).toHaveLength(1)
    expect(screen.getByText('10:00hrs a 11:00hrs')).toBeDefined()
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.org/three')
  })

  test('uses one card presentation for music and exposes day/type controls outside the scroll region', () => {
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

    expect(container.querySelectorAll('article')).toHaveLength(3)
    expect(screen.getByText('19:00hrs a 20:00hrs')).toBeDefined()
    expect(screen.getAllByText('Música').some((element) => element.tagName === 'SPAN')).toBe(true)
    const scroller = container.querySelector('[data-schedule-scroll-region]')!
    expect(scroller.getAttribute('tabindex')).toBe('0')
    expect(scroller.getAttribute('aria-label')).toContain('Cronograma')
    expect(scroller.className).toContain('overflow-y-auto')
    expect(scroller.contains(screen.getByRole('button', { name: 'Talleres' }))).toBe(false)
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '3 oct',
      'Todos',
      'Talleres',
      'Charlas',
      'Música'
    ])
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })

  test('lays out all overlapping types side by side and reflows expanded cards naturally', () => {
    const date = '2026-10-03'
    const { container } = render(
      <ActivityList
        actividades={[
          makeActivity('Taller', 'taller', [occurrence(1, date, '10:00')]),
          makeActivity('Charla', 'charla', [occurrence(2, date, '10:30')]),
          makeActivity('Música', 'musica', [occurrence(3, date, '10:45')]),
          makeActivity('Después', 'taller', [occurrence(4, date, '12:00')])
        ]}
        isEditionPast={false}
      />
    )

    const overlapRow = screen.getByRole('group', { name: /10:00.*11:45/i })
    expect(overlapRow.querySelectorAll('article')).toHaveLength(3)
    expect(overlapRow.getAttribute('data-column-count')).toBe('3')
    expect(container.querySelector('[data-schedule-row] [data-schedule-row]')).toBeNull()
    expect(screen.getByText('Después').closest('[data-schedule-row]')).not.toBe(overlapRow)

    const scroller = container.querySelector('[data-schedule-scroll-region]')!
    expect(scroller.className).toContain('max-h-[34rem]')
    expect(scroller.className).not.toContain('border')
    expect(Array.from(container.querySelectorAll('[data-timeline-time]')).map((time) => time.textContent)).toEqual([
      '10:00',
      '12:00'
    ])
    expect(container.querySelectorAll('[data-timeline-dot][aria-hidden="true"]')).toHaveLength(2)
    expect(overlapRow.querySelector('[data-timeline-time]')?.getAttribute('datetime')).toBe('10:00')

    fireEvent.click(screen.getByRole('button', { name: 'Charlas' }))
    const filteredRow = screen.getByText('Charla').closest('[data-schedule-row]')!
    expect(filteredRow.getAttribute('data-column-count')).toBe('1')
  })

  test('filters by type and changes the selected day', () => {
    const { container } = render(
      <ActivityList
        actividades={[
          makeActivity('Primer día', 'taller', [occurrence(1, '2026-10-03')]),
          makeActivity('Segundo día', 'charla', [occurrence(2, '2026-10-04')])
        ]}
        isEditionPast={false}
      />
    )

    const scroller = container.querySelector('[data-schedule-scroll-region]')!
    scroller.scrollTop = 120
    fireEvent.click(screen.getByRole('button', { name: 'Charlas' }))
    expect(scroller.scrollTop).toBe(0)
    expect(screen.queryByText('Primer día')).toBeNull()
    expect(container.querySelectorAll('[data-schedule-row]')).toHaveLength(0)
    scroller.scrollTop = 120
    fireEvent.click(screen.getByRole('button', { name: '4 oct' }))
    expect(scroller.scrollTop).toBe(0)
    expect(screen.getByText('Segundo día')).toBeDefined()
    expect(screen.queryByText('Primer día')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Talleres' }))
    expect(screen.queryByText('Segundo día')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText('Segundo día')).toBeDefined()
  })

  test('shows dated and undated unscheduled activities only for active editions', () => {
    const activities = [
      makeActivity('Sin hora', 'taller', [occurrence(1, '2026-10-03', null)]),
      makeActivity('Sin fecha', 'charla', [])
    ]
    const { container, unmount } = render(
      <ActivityList actividades={activities} isEditionPast={false} />
    )
    expect(screen.getByText('Horario por confirmar')).toBeDefined()
    expect(screen.getByText('Sin hora')).toBeDefined()
    expect(screen.getByText('Actividades sin fecha')).toBeDefined()
    expect(screen.getByText('Sin fecha')).toBeDefined()
    expect(container.querySelector('section[aria-label="Actividades del 2026-10-03"]')).not.toBeNull()
    unmount()
    render(<ActivityList actividades={activities} isEditionPast />)
    expect(screen.queryByText('Horario por confirmar')).toBeNull()
    expect(screen.queryByText('Actividades sin fecha')).toBeNull()
    expect(screen.queryByText('Sin hora')).toBeNull()
    expect(screen.queryByText('Sin fecha')).toBeNull()
  })

  test('keeps separate activities distinct and hides undated legacy activities', () => {
    const { container } = render(
      <ActivityList
        actividades={[
          makeActivity('Duplicado', 'taller', [occurrence(1, '2026-10-03')]),
          makeActivity('Duplicado', 'taller', [occurrence(2, '2026-10-03')]),
          makeActivity('Legacy', 'charla', [])
        ]}
        isEditionPast
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
