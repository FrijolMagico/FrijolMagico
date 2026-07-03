import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import { ActivityItem } from './ActivityItem'

afterEach(cleanup)

import type { FestivalActivity } from '../../types/festival'

describe('ActivityItem', () => {
  test('renders title and participant, expands to show details', () => {
    const activity: FestivalActivity = {
      titulo: 'Taller de Acuarela',
      descripcion: 'Introducción a acuarela',
      duracion_minutos: 90,
      ubicacion: 'Sala A',
      hora_inicio: '18:00',
      tipo: 'taller',
      fecha: '2025-01-15',
      participante_pseudonimo: 'Artista Ejemplo'
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
      participante_pseudonimo: 'Banda X'
    }

    render(<ActivityItem activity={activity} />)

    expect(screen.getByText('Banda X')).toBeDefined()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(document.querySelector('details')).toBeNull()
  })
})
