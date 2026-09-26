import { afterEach, describe, expect, jest, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

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
    expect(screen.queryByText('Inscríbete Aquí')).toBeNull()
  })

  test('shows the badge on a minimal non-music card but never on a music item', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T17:30:00.000Z'))
    const { container } = render(
      <ActivityItem activity={{ ...activity, descripcion: null }} />
    )
    expect(container.querySelector('details')).toBeNull()
    expect(screen.getByText('Inscríbete').tagName).toBe('SPAN')
    expect(screen.queryByText('Inscríbete Aquí')).toBeNull()
    render(<ActivityItem activity={{ ...activity, tipo: 'musica' }} />)
    expect(screen.getAllByText('Inscríbete')).toHaveLength(1)
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
