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

  test('shows only the Chilean local deadline while preserving the UTC DTO', () => {
    const html = renderToString(<ActivityItem activity={activity} />)
    expect(html).toContain('Inscripciones abiertas hasta el')
    expect(html.replaceAll('<!-- -->', '')).toContain('05/09/2026 13:30hrs')
    expect(html).not.toContain(activity.registration!.end_at)
    expect(activity.registration!.end_at).toBe('2026-09-05T17:30:00.000Z')
  })

  test('hides the registration CTA in server output and shows the top-right link after activation', () => {
    expect(renderToString(<ActivityItem activity={activity} />)).not.toContain(
      'Inscríbete'
    )
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(<ActivityItem activity={activity} />)
    const link = screen.getByRole('link', { name: 'Inscríbete' })
    const article = container.querySelector('article')!

    expect(link.parentElement).toBe(article)
    expect(link.closest('summary, details')).toBeNull()
    expect(container.querySelector('details')?.open).toBe(false)
  })

  test('keeps the top-right CTA outside disclosure details with safe anchor semantics', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(<ActivityItem activity={activity} />)
    const details = container.querySelector('details')!
    const summary = details.querySelector('summary')!
    const link = screen.getByRole('link', { name: 'Inscríbete' })

    expect(details.open).toBe(false)
    expect(link.parentElement).toBe(container.querySelector('article'))
    expect(summary.contains(link)).toBe(false)
    expect(link.closest('details')).toBeNull()
    expect(link.getAttribute('href')).toBe('https://example.org/signup')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link.querySelector('button')).toBeNull()
    expect(link.className).toContain('focus-visible:ring-2')
    expect(link.innerHTML).toContain('group-hover/btn:bg-primary')
    expect(link.innerHTML).toContain('group-focus-visible/btn:text-background')

    fireEvent.click(summary)
    expect(details.open).toBe(true)
    expect(screen.getByRole('link', { name: 'Inscríbete' })).toBe(link)
  })

  test('renders no CTA on the server or outside the window and hides it for malformed data', () => {
    const serverHtml = renderToString(<ActivityItem activity={activity} />)
    expect(serverHtml).not.toContain('Inscríbete')
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T17:30:00.001Z'))
    const { rerender, container } = render(<ActivityItem activity={activity} />)
    expect(container.querySelector('details')).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()

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
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })

  test('never commits a replacement URL with the prior active window before passive reconciliation', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const commits: { href: string | null; cta: boolean }[] = []

    function ObserveCommit({ value }: { value: FestivalActivity }) {
      useLayoutEffect(() => {
        const link = document.querySelector('article > a')
        commits.push({
          href: link?.getAttribute('href') ?? null,
          cta: Boolean(link)
        })
      }, [value])
      return <ActivityItem activity={value} />
    }

    const { rerender } = render(<ObserveCommit value={activity} />)
    expect(
      screen.getByRole('link', { name: 'Inscríbete' }).getAttribute('href')
    ).toBe('https://example.org/signup')
    const malicious = {
      ...activity,
      registration: { ...activity.registration!, url: 'javascript:alert(1)' }
    }
    rerender(<ObserveCommit value={malicious} />)
    expect(commits.at(-1)).toEqual({ href: null, cta: false })
    expect(document.querySelector('article > a')).toBeNull()

    const replacement = {
      ...activity,
      registration: {
        ...activity.registration!,
        url: 'https://example.org/new'
      }
    }
    rerender(<ObserveCommit value={replacement} />)
    expect(commits.at(-1)).toEqual({ href: null, cta: false })
    expect(document.querySelector('article > a')?.getAttribute('href')).toBe(
      'https://example.org/new'
    )

    const invalidWindow = {
      ...activity,
      registration: { ...activity.registration!, end_at: 'invalid' }
    }
    rerender(<ObserveCommit value={invalidWindow} />)
    expect(commits.at(-1)).toEqual({ href: null, cta: false })
    expect(document.querySelector('article > a')).toBeNull()
  })

  test('reconciles the CTA at start, inclusive end, post-end and focus without a request', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:29:59.999Z'))
    const fetchSpy = jest.spyOn(globalThis, 'fetch')
    try {
      const { container } = render(<ActivityItem activity={activity} />)
      const link = () => container.querySelector('article > a')
      expect(link()).toBeNull()
      act(() => jest.advanceTimersByTime(1))
      expect(link()?.textContent).toBe('Inscríbete')
      jest.setSystemTime(new Date('2026-09-05T17:30:00.000Z'))
      act(() => window.dispatchEvent(new window.Event('focus')))
      expect(link()?.getAttribute('href')).toBe('https://example.org/signup')
      act(() => jest.advanceTimersByTime(1))
      expect(link()).toBeNull()
      expect(fetchSpy).not.toHaveBeenCalled()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test('shows the CTA on a minimal non-music card but never on a music item', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T17:30:00.000Z'))
    const { container } = render(
      <ActivityItem activity={{ ...activity, descripcion: null }} />
    )
    expect(container.querySelector('details')).toBeNull()
    expect(screen.getByRole('link', { name: 'Inscríbete' })).toBeDefined()

    const music = render(
      <ActivityItem activity={{ ...activity, tipo: 'musica' }} />
    )
    expect(music.container.querySelector('article > a')).toBeNull()
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
