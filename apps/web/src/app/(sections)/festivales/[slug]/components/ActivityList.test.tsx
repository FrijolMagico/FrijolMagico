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
            ubicacion: null,
            ocurrencias: [],
            tipo: 'musica',
            participante_pseudonimo: 'Banda',
            registration: {
              url: 'https://example.org/signup',
              start_at: '2026-09-05T16:30:00.000Z',
              end_at: '2026-09-05T17:30:00.000Z'
            }
          }
        ]}
        isEditionPast={false}
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
        ubicacion: null,
        ocurrencias: [{ fecha: '2025-01-15', hora_inicio: '18:00', duracion_minutos: 60 }],
        tipo: 'taller',
        participante_pseudonimo: 'A',
        registration: null
      },
      {
        titulo: 'Concierto',
        descripcion: null,
        ubicacion: null,
        ocurrencias: [],
        tipo: 'musica',
        participante_pseudonimo: 'B',
        registration: null
      },
      {
        titulo: 'Taller 2',
        descripcion: null,
        ubicacion: null,
        ocurrencias: [{ fecha: '2025-01-15', hora_inicio: '19:00', duracion_minutos: 60 }],
        tipo: 'taller',
        participante_pseudonimo: 'C',
        registration: null
      }
    ]

    render(<ActivityList actividades={actividades} isEditionPast={false} />)

    // All group headings are present
    expect(screen.getByText('Música')).toBeDefined()
    expect(screen.getByText('Talleres')).toBeDefined()

    // Música is always the last group heading
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings[headings.length - 1].textContent).toBe('Música')

    // Each group renders a list
    const lists = document.querySelectorAll('section > ul')
    expect(lists).toHaveLength(2)

    // The last list (Música) has 1 item
    const lastList = lists[lists.length - 1]
    expect(lastList.querySelectorAll('li')).toHaveLength(1)
  })

  test('keeps one card per workshop and orders by first session with unscheduled last', () => {
    const makeActivity = (title: string, ocurrencias: FestivalActivity['ocurrencias']): FestivalActivity => ({
      titulo: title,
      descripcion: null,
      ubicacion: 'Sala compartida',
      ocurrencias,
      tipo: 'taller',
      participante_pseudonimo: null,
      registration: null
    })
    const { container } = render(<ActivityList actividades={[
      makeActivity('Por confirmar', []),
      makeActivity('Más tarde', [{ fecha: '2025-10-04', hora_inicio: '18:00', duracion_minutos: 30 }]),
      makeActivity('Primero', [
        { fecha: '2025-10-03', hora_inicio: '09:00', duracion_minutos: 60 },
        { fecha: '2025-10-04', hora_inicio: '09:00', duracion_minutos: 60 }
      ])
    ]} isEditionPast={false} />)
    expect(Array.from(container.querySelectorAll('article h3')).map((heading) => heading.textContent)).toEqual([
      'Primero', 'Más tarde', 'Por confirmar'
    ])
    expect(container.querySelectorAll('article')).toHaveLength(3)
    expect(screen.getAllByText('Sala compartida')).toHaveLength(3)
    expect(screen.getByText('Fecha y horario por confirmar')).toBeDefined()
  })

  test('renders empty when no activities', () => {
    render(<ActivityList actividades={[]} isEditionPast={false} />)

    // The section header still renders
    expect(screen.getByText('Actividades')).toBeDefined()
    // No list items when there are no activities
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
