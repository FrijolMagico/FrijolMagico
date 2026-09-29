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
    ).toHaveLength(0)
    expect(container.querySelectorAll('article h3')).toHaveLength(2)
    expect(Array.from(container.querySelectorAll('article h3')).map((title) => title.textContent)).toEqual([
      'Taller',
      'Taller'
    ])
    expect(screen.getByText('09:00hrs a 10:00hrs')).toBeDefined()
    expect(screen.getByText('12:00hrs a 13:00hrs')).toBeDefined()
    expect(
      Array.from(container.querySelectorAll('a')).map((link) => link.getAttribute('href'))
    ).toEqual(['https://example.org/one', 'https://example.org/two'])
    expect(container.textContent).not.toContain('2026-10-03')
    expect(container.textContent).not.toContain('2026-10-04')

    fireEvent.click(screen.getByRole('button', { name: '4 Octubre' }))
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
    const badges = Array.from(container.querySelectorAll('article > span.rounded-full'))
    expect(badges).toHaveLength(3)
    expect(badges.map((badge) => badge.textContent)).toEqual(['Charla', 'Taller', 'Música'])
    expect(badges.map((badge) => badge.className)).toEqual([
      expect.stringContaining('bg-palette-secondary/15'),
      expect.stringContaining('bg-palette-primary/10'),
      expect.stringContaining('bg-palette-accent/15')
    ])
    expect(badges.every((badge) => badge.className.includes('text-palette-foreground'))).toBe(true)
    expect(badges.every((badge) => badge.parentElement?.tagName === 'ARTICLE')).toBe(true)
    expect(badges.every((badge) => badge.className.includes('-top-2') && badge.className.includes('-left-2'))).toBe(true)
    expect(container.querySelectorAll('article h3 + span.rounded-full')).toHaveLength(0)
    const scroller = container.querySelector('[data-schedule-scroll-region]')!
    expect(scroller.getAttribute('tabindex')).toBe('0')
    expect(scroller.getAttribute('aria-label')).toContain('Cronograma')
    expect(scroller.className).toContain('overflow-y-auto')
    expect(scroller.contains(screen.getByRole('button', { name: 'Talleres' }))).toBe(false)
    const heading = screen.getByRole('heading', { name: 'Actividades - 3' })
    expect(heading.className).toContain('text-4xl')
    expect(heading.className).toContain('md:text-5xl')
    expect(heading.className).toContain('font-black')
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '3 Octubre',
      'Todos',
      'Talleres',
      'Charlas',
      'Música'
    ])
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })

  test('groups cards only by unique start time, regardless of overlapping durations', () => {
    const date = '2026-10-03'
    const { container } = render(
      <ActivityList
        actividades={[
          makeActivity('Taller 11', 'taller', [occurrence(1, date, '11:00')]),
          makeActivity('Charla 11', 'charla', [occurrence(2, date, '11:00')]),
          makeActivity('Música 11', 'musica', [occurrence(3, date, '11:00')]),
          makeActivity('Taller 11:30', 'taller', [occurrence(4, date, '11:30')]),
          makeActivity('Charla 12:30', 'charla', [occurrence(5, date, '12:30')]),
          makeActivity('Taller 12:30', 'taller', [occurrence(6, date, '12:30')])
        ]}
        isEditionPast={false}
      />
    )

    const rows = Array.from(container.querySelectorAll('[data-schedule-row]'))
    expect(rows).toHaveLength(3)
    expect(rows.map((row) => row.querySelector('[data-timeline-time]')?.textContent)).toEqual([
      '11:00',
      '11:30',
      '12:30'
    ])
    expect(rows.map((row) => row.getAttribute('data-column-count'))).toEqual(['3', '1', '2'])
    expect(rows.map((row) => row.querySelectorAll('article').length)).toEqual([3, 1, 2])
    const cardGrids = rows.map((row) => row.querySelector<HTMLElement>(':scope > div:last-child')!)
    expect(cardGrids.map((grid) => grid.style.getPropertyValue('--schedule-columns'))).toEqual(['3', '2', '2'])
    expect(cardGrids.every((grid) => !grid.style.maxWidth)).toBe(true)
    expect(cardGrids[0].className).toContain('items-start')
    expect(cardGrids[0].className).not.toContain(':has(')
    expect(cardGrids[0].querySelector(':scope > div')?.className).not.toContain('flex')
    expect(rows[0].getAttribute('aria-label')).toBe('11:00 a 12:00')
    expect(rows[1].getAttribute('aria-label')).toBe('11:30 a 12:30')
    expect(container.querySelectorAll('[data-timeline-time]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-timeline-dot][aria-hidden="true"]')).toHaveLength(3)

    const scroller = container.querySelector('[data-schedule-scroll-region]')!
    expect(scroller.className).toContain('max-h-[34rem]')
    expect(scroller.className).not.toContain('border')

    fireEvent.click(screen.getByRole('button', { name: 'Charlas' }))
    const filteredRows = Array.from(container.querySelectorAll('[data-schedule-row]'))
    expect(filteredRows).toHaveLength(2)
    expect(filteredRows.map((row) => row.querySelector('[data-timeline-time]')?.textContent)).toEqual([
      '11:00',
      '12:30'
    ])
    expect(filteredRows.map((row) => row.getAttribute('data-column-count'))).toEqual(['1', '1'])
    expect(container.querySelectorAll('[data-timeline-time]')).toHaveLength(2)
    expect(screen.queryByText('Taller 11:30')).toBeNull()
  })

  test('opens an earlier card without changing later rows or timeline marks', () => {
    const date = '2026-10-03'
    const { container } = render(
      <ActivityList
        actividades={[
          {
            ...makeActivity('Earlier activity', 'taller', [occurrence(1, date, '10:00')]),
            descripcion: 'Details for the earlier activity'
          },
          {
            ...makeActivity('Later activity', 'charla', [occurrence(2, date, '11:00')]),
            descripcion: 'Details for the later activity'
          }
        ]}
        isEditionPast={false}
      />
    )

    const rowsBefore = Array.from(container.querySelectorAll('[data-schedule-row]'))
    const timelineMarksBefore = Array.from(container.querySelectorAll('[data-timeline-time]')).map(
      (time) => time.textContent
    )
    expect(rowsBefore).toHaveLength(2)

    const earlierDetails = rowsBefore[0].querySelector('details')!
    fireEvent.click(earlierDetails.querySelector('summary')!)

    const rowsAfter = Array.from(container.querySelectorAll('[data-schedule-row]'))
    expect(earlierDetails.open).toBe(true)
    expect(rowsAfter).toEqual(rowsBefore)
    expect(rowsAfter[0].compareDocumentPosition(rowsAfter[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(
      Array.from(container.querySelectorAll('[data-timeline-time]')).map((time) => time.textContent)
    ).toEqual(timelineMarksBefore)
    expect(timelineMarksBefore).toEqual(['10:00', '11:00'])
  })

  test('lets a disclosure grow while a closed sibling in its row keeps its natural size', () => {
    const date = '2026-10-03'
    const { container } = render(
      <ActivityList
        actividades={[
          {
            ...makeActivity('Expandable', 'taller', [occurrence(1, date)]),
            descripcion: 'Expanded content'
          },
          makeActivity('Closed sibling', 'charla', [occurrence(2, date)])
        ]}
        isEditionPast={false}
      />
    )

    const grid = container.querySelector('[data-schedule-row] > div:last-child')!
    const [expandable, sibling] = Array.from(grid.querySelectorAll('article'))
    const details = expandable.querySelector('details')!

    expect(grid.className).toContain('items-start')
    expect(grid.className).not.toContain(':has(')
    expect(grid.querySelector(':scope > div')?.className).not.toContain('flex')
    expect(details.open).toBe(false)
    fireEvent.click(details.querySelector('summary')!)
    expect(details.open).toBe(true)
    expect(sibling.querySelector('details')).toBeNull()
    expect(grid.className).toContain('items-start')
    expect(grid.className).not.toContain(':has(')
    expect(grid.querySelector(':scope > div')?.className).not.toContain('flex')
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
    fireEvent.click(screen.getByRole('button', { name: '4 Octubre' }))
    expect(scroller.scrollTop).toBe(0)
    const heading = screen.getByRole('heading', { name: 'Actividades - 4' })
    const dayNumber = heading.querySelectorAll('span')[1]
    expect(dayNumber.className).toContain('w-[2ch]')
    expect(dayNumber.className).toContain('tabular-nums')
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
    expect(Array.from(container.querySelectorAll('article span.rounded-full')).map((badge) => badge.textContent)).toEqual([
      'Taller',
      'Charla'
    ])
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

  test('reserves two tabular digit cells in day buttons across single- and double-digit days', () => {
    render(
      <ActivityList
        actividades={[
          makeActivity('Día nueve', 'taller', [occurrence(1, '2026-10-09')]),
          makeActivity('Día diez', 'taller', [occurrence(2, '2026-10-10')])
        ]}
        isEditionPast={false}
      />
    )

    for (const label of ['9 Octubre', '10 Octubre']) {
      const button = screen.getByRole('button', { name: label })
      const dayNumber = button.querySelector('span')!
      expect(dayNumber.textContent).toBe(label.startsWith('9 ') ? '9' : '10')
      expect(dayNumber.className).toContain('w-[2ch]')
      expect(dayNumber.className).toContain('tabular-nums')
    }
  })

  test('renders only the section heading when no dated activities exist', () => {
    render(<ActivityList actividades={[]} isEditionPast={false} />)
    expect(screen.getByText('Actividades')).toBeDefined()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
