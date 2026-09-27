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
  const baseActivity: FestivalActivity = {
    titulo: 'Taller',
    descripcion: 'Aprende',
    ubicacion: null,
    ocurrencias: [],
    tipo: 'taller',
    participante_pseudonimo: 'Artista',
    registration: {
      url: 'https://example.org/signup',
      start_at: '2026-09-05T16:30:00.000Z',
      end_at: '2026-09-05T17:30:00.000Z'
    }
  }

  const baseProps = { activity: baseActivity, isEditionPast: false }

  test('shows only the Chilean local deadline while preserving the UTC DTO', () => {
    const html = renderToString(<ActivityItem {...baseProps} />)
    expect(html).toContain('Inscripciones abiertas hasta el')
    expect(html.replaceAll('<!-- -->', '')).toContain('05/09/2026 13:30hrs')
    expect(html).not.toContain(baseActivity.registration!.end_at)
    expect(baseActivity.registration!.end_at).toBe('2026-09-05T17:30:00.000Z')
  })

  test('hides the registration CTA in server output and shows the top-right link after activation', () => {
    expect(renderToString(<ActivityItem {...baseProps} />)).not.toContain(
      'Inscríbete'
    )
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(<ActivityItem {...baseProps} />)
    const link = screen.getByRole('link', { name: 'Inscríbete' })
    const article = container.querySelector('article')!

    expect(link.parentElement).toBe(article)
    expect(link.closest('summary, details')).toBeNull()
    expect(container.querySelector('details')?.open).toBe(false)
  })

  test('keeps the top-right CTA outside disclosure details with safe anchor semantics', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(<ActivityItem {...baseProps} />)
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
    const serverHtml = renderToString(<ActivityItem {...baseProps} />)
    expect(serverHtml).not.toContain('Inscríbete')
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T17:30:00.001Z'))
    const { rerender, container } = render(<ActivityItem {...baseProps} />)
    expect(container.querySelector('details')).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()

    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    rerender(
      <ActivityItem
        {...baseProps}
        activity={{
          ...baseActivity,
          registration: {
            ...baseActivity.registration!,
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
      return <ActivityItem {...baseProps} activity={value} />
    }

    const { rerender } = render(<ObserveCommit value={baseActivity} />)
    expect(
      screen.getByRole('link', { name: 'Inscríbete' }).getAttribute('href')
    ).toBe('https://example.org/signup')
    const malicious = {
      ...baseActivity,
      registration: { ...baseActivity.registration!, url: 'javascript:alert(1)' }
    }
    rerender(<ObserveCommit value={malicious} />)
    expect(commits.at(-1)).toEqual({ href: null, cta: false })
    expect(document.querySelector('article > a')).toBeNull()

    const replacement = {
      ...baseActivity,
      registration: {
        ...baseActivity.registration!,
        url: 'https://example.org/new'
      }
    }
    rerender(<ObserveCommit value={replacement} />)
    expect(commits.at(-1)).toEqual({ href: null, cta: false })
    expect(document.querySelector('article > a')?.getAttribute('href')).toBe(
      'https://example.org/new'
    )

    const invalidWindow = {
      ...baseActivity,
      registration: { ...baseActivity.registration!, end_at: 'invalid' }
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
      const { container } = render(<ActivityItem {...baseProps} />)
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
      <ActivityItem {...baseProps} activity={{ ...baseActivity, descripcion: null }} />
    )
    expect(container.querySelector('details')).toBeNull()
    expect(screen.getByRole('link', { name: 'Inscríbete' })).toBeDefined()

    const music = render(
      <ActivityItem {...baseProps} activity={{ ...baseActivity, tipo: 'musica' }} />
    )
    expect(music.container.querySelector('article > a')).toBeNull()
  })

  test('renders title and participant, expands to show details', () => {
    const activity: FestivalActivity = {
      titulo: 'Taller de Acuarela',
      descripcion: 'Introducción a acuarela',
      ubicacion: 'Sala A',
      ocurrencias: [{ fecha: '2025-01-15', hora_inicio: '18:00', duracion_minutos: 90 }],
      tipo: 'taller',
      participante_pseudonimo: 'Artista Ejemplo',
      registration: null
    }

    render(<ActivityItem activity={activity} isEditionPast={false} />)

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

    expect(screen.getByText('15 ene 2025 — 18:00hrs')).toBeDefined()
    expect(screen.getByText('Sala A')).toBeDefined()
    expect(screen.getByText('Introducción a acuarela')).toBeDefined()
    expect(screen.getByText('(90 min)')).toBeDefined()
  })

  test('lists Chile-local sessions across days and within a day without timezone conversion', () => {
    const html = renderToString(<ActivityItem activity={{
      ...baseActivity,
      registration: null,
      ocurrencias: [
        { fecha: '2026-09-05', hora_inicio: '09:00', duracion_minutos: 45 },
        { fecha: '2026-09-05', hora_inicio: '12:30', duracion_minutos: 60 },
        { fecha: '2026-09-07', hora_inicio: '10:00', duracion_minutos: 90 }
      ]
    }} isEditionPast={false} />)
    const text = html.replaceAll('<!-- -->', '')
    expect(text).toContain('5 sep 2026 — 09:00')
    expect(text).toContain('5 sep 2026 — 12:30')
    expect(text).toContain('7 sep 2026 — 10:00')
    expect(text).toContain('(45 min)')
    expect(text).toContain('(60 min)')
    expect(text).toContain('(90 min)')
    expect(html).not.toContain('Fecha y horario por confirmar')
  })

  test('shows exact unscheduled copy without invented date or duration', () => {
    const html = renderToString(<ActivityItem activity={{ ...baseActivity, registration: null }} isEditionPast={false} />)
    expect(html).toContain('Fecha y horario por confirmar')
    expect(html).not.toContain('<time')
    expect(html).not.toContain('Duración:')
  })

  test('renders minimal with participant name, no title or chevron', () => {
    const activity: FestivalActivity = {
      titulo: null,
      descripcion: null,
      ubicacion: null,
      ocurrencias: [],
      tipo: 'musica',
      participante_pseudonimo: 'Banda X',
      registration: null
    }

    render(<ActivityItem activity={activity} isEditionPast={false} />)

    expect(screen.getByText('Banda X')).toBeDefined()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(document.querySelector('details')).toBeNull()
  })
})