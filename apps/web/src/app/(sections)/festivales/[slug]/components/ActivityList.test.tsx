import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'

import { ActivityList } from './ActivityList'

afterEach(cleanup)

import type { FestivalActivity } from '../../types/festival'

describe('ActivityList', () => {
  test('groups activities by type with Música always last', () => {
    const actividades: FestivalActivity[] = [
      {
        titulo: 'Taller 1',
        descripcion: null,
        duracion_minutos: null,
        ubicacion: null,
        hora_inicio: '18:00',
        tipo: 'taller',
        fecha: '2025-01-15',
        participante_pseudonimo: 'A'
      },
      {
        titulo: 'Concierto',
        descripcion: null,
        duracion_minutos: null,
        ubicacion: null,
        hora_inicio: '20:00',
        tipo: 'musica',
        fecha: '2025-01-16',
        participante_pseudonimo: 'B'
      },
      {
        titulo: 'Taller 2',
        descripcion: null,
        duracion_minutos: null,
        ubicacion: null,
        hora_inicio: '19:00',
        tipo: 'taller',
        fecha: '2025-01-15',
        participante_pseudonimo: 'C'
      }
    ]

    render(<ActivityList actividades={actividades} />)

    // All group headings are present
    expect(screen.getByText('Música')).toBeDefined()
    expect(screen.getByText('Talleres')).toBeDefined()

    // Música is always the last group heading
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings[headings.length - 1].textContent).toBe('Música')

    // Each group renders a list
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(2)

    // The last list (Música) has 1 item
    const lastList = lists[lists.length - 1]
    expect(lastList.querySelectorAll('li')).toHaveLength(1)
  })

  test('renders empty when no activities', () => {
    render(<ActivityList actividades={[]} />)

    // The section header still renders
    expect(screen.getByText('Actividades')).toBeDefined()
    // No list items when there are no activities
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
