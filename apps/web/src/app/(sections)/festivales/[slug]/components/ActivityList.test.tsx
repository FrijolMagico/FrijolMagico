import { afterEach, describe, expect, jest, test } from 'bun:test'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { ActivityList } from './ActivityList'

import type { FestivalActivity } from '../../types/festival'

afterEach(() => {
  jest.useRealTimers()
})

async function clickAndFlushMutationObserver(button: HTMLElement) {
  await act(async () => {
    fireEvent.click(button)
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  })
}

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
  test('remeasures the scroll cue after filtered DOM changes and disconnects its observer', () => {
    const observers: Array<
      MutationObserver & {
        callback: MutationCallback
        observedTarget: Node | null
        observedOptions: MutationObserverInit | undefined
        disconnected: boolean
      }
    > = []
    const originalMutationObserver = Object.getOwnPropertyDescriptor(
      globalThis,
      'MutationObserver'
    )

    class ControlledMutationObserver implements MutationObserver {
      observedTarget: Node | null = null
      observedOptions: MutationObserverInit | undefined
      disconnected = false

      constructor(readonly callback: MutationCallback) {
        observers.push(this)
      }

      observe(target: Node, options?: MutationObserverInit) {
        this.observedTarget = target
        this.observedOptions = options
      }

      disconnect() {
        this.disconnected = true
      }

      takeRecords() {
        return []
      }

      trigger() {
        this.callback([], this)
      }
    }

    Object.defineProperty(globalThis, 'MutationObserver', {
      configurable: true,
      value: ControlledMutationObserver
    })

    try {
      const { container, unmount } = render(
        <ActivityList
          actividades={[
            makeActivity('Workshop', 'taller', [occurrence(1, '2026-10-03')]),
            makeActivity('Talk', 'charla', [occurrence(2, '2026-10-03', '11:00')])
          ]}
          isEditionPast={false}
        />
      )
      const scroller = container.querySelector<HTMLElement>(
        '[data-schedule-scroll-region]'
      )!
      Object.defineProperty(scroller, 'clientHeight', { value: 100 })
      Object.defineProperty(scroller, 'scrollHeight', { value: 200 })
      const observer = observers[0]!
      const cue = container.querySelector('svg.lucide-chevron-down')?.parentElement

      expect(observer.observedTarget).toBe(scroller)
      expect(observer.observedOptions).toEqual({ childList: true, subtree: true })
      expect(cue).not.toBeNull()
      expect(cue?.classList.contains('opacity-100')).toBe(false)

      fireEvent.click(screen.getByRole('button', { name: 'Charlas' }))
      act(() => observer.callback([], observer as unknown as MutationObserver))

      expect(cue?.classList.contains('opacity-100')).toBe(true)
      unmount()
      expect(observer.disconnected).toBe(true)
    } finally {
      if (originalMutationObserver) {
        Object.defineProperty(globalThis, 'MutationObserver', originalMutationObserver)
      } else {
        Reflect.deleteProperty(globalThis, 'MutationObserver')
      }
    }
  })

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
    const badges = Array.from(container.querySelectorAll('article > span'))
    expect(badges).toHaveLength(3)
    expect(badges.map((badge) => badge.textContent)).toEqual(['Charla', 'Taller', 'Música'])
    expect(badges.every((badge) => badge.parentElement?.tagName === 'ARTICLE')).toBe(true)
    expect(badges.every((badge) => !badge.hasAttribute('role'))).toBe(true)
    expect(badges.every((badge) => !badge.hasAttribute('tabindex'))).toBe(true)
    expect(container.querySelectorAll('article h3 + span')).toHaveLength(0)
    const scroller = container.querySelector('[data-schedule-scroll-region]')!
    expect(scroller.getAttribute('tabindex')).toBe('0')
    expect(scroller.getAttribute('aria-label')).toContain('Cronograma')
    expect(scroller.contains(screen.getByRole('button', { name: 'Talleres' }))).toBe(false)
    const heading = screen.getByRole('heading', { name: 'Actividades Día 3' })
    expect(heading.id).not.toBe('')
    expect(
      container.querySelector('section[aria-labelledby]')?.getAttribute('aria-labelledby')
    ).toBe(heading.id)
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '3 Octubre',
      'Todos',
      'Talleres',
      'Charlas',
      'Música'
    ])
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })

  test('groups cards only by unique start time, regardless of overlapping durations', async () => {
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
    const columns = (grid: HTMLElement) => Array.from(grid.children)
    expect(columns(cardGrids[0]!)).toHaveLength(3)
    expect(columns(cardGrids[1]!)).toHaveLength(1)
    expect(
      columns(cardGrids[0]!).every((column) => column.querySelectorAll('article').length === 1)
    ).toBe(true)
    expect(rows[0].getAttribute('aria-label')).toBe('11:00 a 12:00')
    expect(rows[1].getAttribute('aria-label')).toBe('11:30 a 12:30')
    expect(container.querySelectorAll('[data-timeline-time]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-timeline-dot][aria-hidden="true"]')).toHaveLength(3)

    await clickAndFlushMutationObserver(
      screen.getByRole('button', { name: 'Charlas' })
    )
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

  test('opens one card disclosure without changing its sibling in the same row', () => {
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
    const cardCount = () => Array.from(grid.children).length

    expect(cardCount()).toBe(2)
    expect(
      Array.from(grid.children).every((column) => column.querySelectorAll('article').length === 1)
    ).toBe(true)
    expect(details.open).toBe(false)
    fireEvent.click(details.querySelector('summary')!)
    expect(details.open).toBe(true)
    expect(sibling.querySelector('details')).toBeNull()
    expect(cardCount()).toBe(2)
    expect(sibling.textContent).toContain('Closed sibling')
  })

  test('filters by type and changes the selected day', async () => {
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
    await clickAndFlushMutationObserver(
      screen.getByRole('button', { name: 'Charlas' })
    )
    expect(scroller.scrollTop).toBe(0)
    expect(screen.queryByText('Primer día')).toBeNull()
    expect(container.querySelectorAll('[data-schedule-row]')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Música' })).toBeNull()
    scroller.scrollTop = 120
    await clickAndFlushMutationObserver(
      screen.getByRole('button', { name: '4 Octubre' })
    )
    expect(scroller.scrollTop).toBe(0)
    const heading = screen.getByRole('heading', { name: 'Actividades Día 4' })
    const dayNumber = heading.querySelectorAll('span')[1]
    expect(dayNumber.textContent).toBe('Día 4')
    expect(screen.getByText('Segundo día')).toBeDefined()
    expect(screen.queryByText('Primer día')).toBeNull()
    await clickAndFlushMutationObserver(
      screen.getByRole('button', { name: 'Talleres' })
    )
    expect(screen.queryByText('Segundo día')).toBeNull()
    await clickAndFlushMutationObserver(screen.getByRole('button', { name: 'Todos' }))
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
    expect(Array.from(container.querySelectorAll('article > span')).map((badge) => badge.textContent)).toEqual([
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

  test('labels each day button with its day number and month', () => {
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
      expect(dayNumber.textContent).toBe(label)
      expect(button.textContent).toBe(label)
    }
  })

  test('shows music when it exists only in an undated activity', () => {
    const { container } = render(
      <ActivityList
        actividades={[makeActivity('Undated music', 'musica', [])]}
        isEditionPast={false}
      />
    )

    expect(screen.getByRole('button', { name: 'Música' })).toBeDefined()
    expect(screen.getByText('Undated music')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Música' }))
    expect(screen.getByText('Undated music')).toBeDefined()
    expect(container.querySelectorAll('article')).toHaveLength(1)
  })

  test('keeps a valid selected type on prop changes and falls back to all when it disappears', () => {
    const workshop = makeActivity('Workshop', 'taller', [occurrence(1, '2026-10-03')])
    const talk = makeActivity('Talk', 'charla', [occurrence(2, '2026-10-03')])
    const { rerender } = render(
      <ActivityList actividades={[workshop, talk]} isEditionPast={false} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Charlas' }))
    expect(screen.getByRole('button', { name: 'Charlas' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.queryByText('Workshop')).toBeNull()

    rerender(<ActivityList actividades={[talk]} isEditionPast={false} />)
    expect(screen.getByRole('button', { name: 'Charlas' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Talk')).toBeDefined()
    expect(screen.queryByText('Workshop')).toBeNull()

    rerender(<ActivityList actividades={[workshop]} isEditionPast={false} />)
    expect(screen.getByRole('button', { name: 'Todos' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.queryByRole('button', { name: 'Charlas' })).toBeNull()
    expect(screen.getByText('Workshop')).toBeDefined()

    rerender(<ActivityList actividades={[workshop, talk]} isEditionPast={false} />)
    expect(screen.getByRole('button', { name: 'Todos' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Charlas' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByText('Workshop')).toBeDefined()
    expect(screen.getByText('Talk')).toBeDefined()
  })

  test('renders only Todos when the edition has no recognized activity types', () => {
    render(
      <ActivityList
        actividades={[makeActivity('Other activity', 'otro', [])]}
        isEditionPast={false}
      />
    )

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Todos'
    ])
  })

  test('renders only the section heading and Todos when the edition is empty', () => {
    render(<ActivityList actividades={[]} isEditionPast={false} />)
    expect(screen.getByText('Actividades')).toBeDefined()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Todos'
    ])
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
