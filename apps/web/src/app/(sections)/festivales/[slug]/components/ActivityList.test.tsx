import { afterEach, describe, expect, jest, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'

import { ActivityList } from './ActivityList'

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

import type { FestivalActivity } from '../../types/festival'

describe('ActivityList', () => {
  test('routes music with unexpected registration data away from the badge', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    render(
      <ActivityList
        actividades={[
          {
            titulo: 'Concierto',
            descripcion: 'Concierto en vivo',
            duracion_minutos: null,
            ubicacion: null,
            hora_inicio: null,
            tipo: 'musica',
            fecha: null,
            participante_pseudonimo: 'Banda',
            registration: {
              url: 'https://example.org/signup',
              start_at: '2026-09-05T16:30:00.000Z',
              end_at: '2026-09-05T17:30:00.000Z'
            }
          }
        ]}
      />
    )
    expect(screen.getByText('Banda')).toBeDefined()
    expect(screen.queryByText('Inscríbete')).toBeNull()
    expect(
      screen.queryByRole('link', { hidden: true, name: 'Inscríbete Aquí' })
    ).toBeNull()
    expect(document.querySelector('details a')).toBeNull()
  })

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
        participante_pseudonimo: 'A',
        registration: null
      },
      {
        titulo: 'Concierto',
        descripcion: null,
        duracion_minutos: null,
        ubicacion: null,
        hora_inicio: '20:00',
        tipo: 'musica',
        fecha: '2025-01-16',
        participante_pseudonimo: 'B',
        registration: null
      },
      {
        titulo: 'Taller 2',
        descripcion: null,
        duracion_minutos: null,
        ubicacion: null,
        hora_inicio: '19:00',
        tipo: 'taller',
        fecha: '2025-01-15',
        participante_pseudonimo: 'C',
        registration: null
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
