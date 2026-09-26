import { afterEach, describe, expect, jest, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { useLayoutEffect } from 'react'

import { ActivityItem } from './ActivityItem'

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

import type { FestivalActivity } from '../../types/festival'

describe('ActivityItem', () => {
  const activity: FestivalActivity = {
    titulo: 'Taller',
    descripcion: 'Aprende',
    duracion_minutos: null,
    ubicacion: null,
    hora_inicio: null,
    tipo: 'taller',
    fecha: null,
    participante_pseudonimo: 'Artista',
    registration: {
      url: 'https://example.org/signup',
      start_at: '2026-09-05T16:30:00.000Z',
      end_at: '2026-09-05T17:30:00.000Z'
    }
  }

  test('hides registration in server output and shows badge outside collapsed details after mount', () => {
    expect(renderToString(<ActivityItem activity={activity} />)).not.toContain(
      'Inscríbete'
    )
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(<ActivityItem activity={activity} />)
    const badge = screen.getByText('Inscríbete')
    expect(badge.tagName).toBe('SPAN')
    expect(badge.closest('summary, details')).toBeNull()
    expect(container.querySelector('details')?.open).toBe(false)
    const closedLink = screen.getByRole('link', {
      hidden: true,
      name: 'Inscríbete Aquí'
    })
    expect(closedLink.closest('details')).toBe(
      container.querySelector('details')
    )
    expect(closedLink.closest('summary')).toBeNull()
  })

  test('keeps the active link inside closed details, last in expanded content, with safe anchor semantics', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(<ActivityItem activity={activity} />)
    const details = container.querySelector('details')!
    const summary = details.querySelector('summary')!
    const content = details.querySelector('div.border-t')!
    const link = screen.getByRole('link', {
      hidden: true,
      name: 'Inscríbete Aquí'
    })

    expect(details.open).toBe(false)
    expect(link.closest('summary')).toBeNull()
    expect(summary.contains(link)).toBe(false)
    expect(content.lastElementChild).toBe(link)
    expect(link.getAttribute('href')).toBe('https://example.org/signup')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link.querySelector('button')).toBeNull()
    expect(link.className).toContain('focus-visible:ring-2')
    expect(link.innerHTML).toContain('group-hover/btn:bg-primary')
    expect(link.innerHTML).toContain('group-focus-visible/btn:text-background')

    fireEvent.click(summary)
    expect(details.open).toBe(true)
    expect(screen.getByRole('link', { name: 'Inscríbete Aquí' })).toBe(link)
    expect(screen.getByText('Inscríbete').closest('details')).toBeNull()
  })

  test('renders neither label on server and removes both affordances outside the window or for malformed data', () => {
    const serverHtml = renderToString(<ActivityItem activity={activity} />)
    expect(serverHtml).not.toContain('Inscríbete')
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T17:30:00.001Z'))
    const { rerender, container } = render(<ActivityItem activity={activity} />)
    expect(container.querySelector('details')).not.toBeNull()
    expect(screen.queryByText('Inscríbete')).toBeNull()
    expect(
      screen.queryByRole('link', { hidden: true, name: 'Inscríbete Aquí' })
    ).toBeNull()

    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    rerender(
      <ActivityItem
        activity={{
          ...activity,
          registration: {
            ...activity.registration!,
            url: 'javascript:alert(1)'
          }
        }}
      />
    )
    expect(screen.queryByText('Inscríbete')).toBeNull()
    expect(
      screen.queryByRole('link', { hidden: true, name: 'Inscríbete Aquí' })
    ).toBeNull()
  })

  test('never commits a replacement URL with the prior active window before passive reconciliation', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const commits: { href: string | null; badge: boolean }[] = []

    function ObserveCommit({ value }: { value: FestivalActivity }) {
      useLayoutEffect(() => {
        commits.push({
          href:
            document.querySelector('details a')?.getAttribute('href') ?? null,
          badge: Boolean(document.querySelector('article > span'))
        })
      }, [value])
      return <ActivityItem activity={value} />
    }

    const { rerender } = render(<ObserveCommit value={activity} />)
    expect(
      screen
        .getByRole('link', { hidden: true, name: 'Inscríbete Aquí' })
        .getAttribute('href')
    ).toBe('https://example.org/signup')
    const malicious = {
      ...activity,
      registration: { ...activity.registration!, url: 'javascript:alert(1)' }
    }
    rerender(<ObserveCommit value={malicious} />)
    expect(commits.at(-1)).toEqual({ href: null, badge: false })
    expect(document.querySelector('details a')).toBeNull()

    const replacement = {
      ...activity,
      registration: {
        ...activity.registration!,
        url: 'https://example.org/new'
      }
    }
    rerender(<ObserveCommit value={replacement} />)
    expect(commits.at(-1)).toEqual({ href: null, badge: false })
    expect(document.querySelector('details a')?.getAttribute('href')).toBe(
      'https://example.org/new'
    )

    const invalidWindow = {
      ...activity,
      registration: { ...activity.registration!, end_at: 'invalid' }
    }
    rerender(<ObserveCommit value={invalidWindow} />)
    expect(commits.at(-1)).toEqual({ href: null, badge: false })
    expect(document.querySelector('details a')).toBeNull()
  })

  test('reconciles both leaves at start, inclusive end, post-end and focus without a request', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:29:59.999Z'))
    const fetchSpy = jest.spyOn(globalThis, 'fetch')
    try {
      const { container } = render(<ActivityItem activity={activity} />)
      const link = () => container.querySelector('details a')
      expect(link()).toBeNull()
      act(() => jest.advanceTimersByTime(1))
      expect(link()?.textContent).toBe('Inscríbete Aquí')
      expect(screen.getByText('Inscríbete').tagName).toBe('SPAN')
      jest.setSystemTime(new Date('2026-09-05T17:30:00.000Z'))
      act(() => window.dispatchEvent(new window.Event('focus')))
      expect(link()?.getAttribute('href')).toBe('https://example.org/signup')
      act(() => jest.advanceTimersByTime(1))
      expect(link()).toBeNull()
      expect(screen.queryByText('Inscríbete')).toBeNull()
      expect(fetchSpy).not.toHaveBeenCalled()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test('shows the badge on a minimal non-music card but never on a music item', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T17:30:00.000Z'))
    const { container } = render(
      <ActivityItem activity={{ ...activity, descripcion: null }} />
    )
    expect(container.querySelector('details')).toBeNull()
    expect(screen.getByText('Inscríbete').tagName).toBe('SPAN')
    expect(
      screen.queryByRole('link', { hidden: true, name: 'Inscríbete Aquí' })
    ).toBeNull()
    render(<ActivityItem activity={{ ...activity, tipo: 'musica' }} />)
    expect(screen.getAllByText('Inscríbete')).toHaveLength(1)
    expect(
      screen.queryByRole('link', { hidden: true, name: 'Inscríbete Aquí' })
    ).toBeNull()
  })

  test('renders title and participant, expands to show details', () => {
    const activity: FestivalActivity = {
      titulo: 'Taller de Acuarela',
      descripcion: 'Introducción a acuarela',
      duracion_minutos: 90,
      ubicacion: 'Sala A',
      hora_inicio: '18:00',
      tipo: 'taller',
      fecha: '2025-01-15',
      participante_pseudonimo: 'Artista Ejemplo',
      registration: null
    }

    render(<ActivityItem activity={activity} />)

    // Always visible
    expect(screen.getByText('Taller de Acuarela')).toBeDefined()
    expect(screen.getByText('Artista Ejemplo')).toBeDefined()

    // Chevron exists (has details)
    const details = document.querySelector('details')!
    expect(details).toBeDefined()
    expect(details.open).toBe(false)

    // Expand via summary click
    const summary = details.querySelector('summary')!
    fireEvent.click(summary)
    expect(details.open).toBe(true)

    expect(screen.getByText('2025-01-15 — 18:00')).toBeDefined()
    expect(screen.getByText('Sala A')).toBeDefined()
    expect(screen.getByText('Introducción a acuarela')).toBeDefined()
    expect(screen.getByText('Duración: 90 min')).toBeDefined()
  })

  test('renders minimal with participant name, no title or chevron', () => {
    const activity: FestivalActivity = {
      titulo: null,
      descripcion: null,
      duracion_minutos: null,
      ubicacion: null,
      hora_inicio: null,
      tipo: 'musica',
      fecha: null,
      participante_pseudonimo: 'Banda X',
      registration: null
    }

    render(<ActivityItem activity={activity} />)

    expect(screen.getByText('Banda X')).toBeDefined()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(document.querySelector('details')).toBeNull()
  })
})
