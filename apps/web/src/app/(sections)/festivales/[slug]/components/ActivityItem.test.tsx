import { afterEach, describe, expect, jest, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

import { ActivityItem } from './ActivityItem'

import type { FestivalActivity } from '../../types/festival'

const registration = {
  start_at: '2026-09-05T16:30:00.000Z',
  end_at: '2026-09-05T17:30:00.000Z'
}
const baseActivity: FestivalActivity = {
  titulo: 'Taller',
  descripcion: null,
  ubicacion: null,
  ocurrencias: [
    {
      id: 1,
      fecha: '2026-09-05',
      hora_inicio: '14:00',
      duracion_minutos: 90,
      registration_url: 'https://example.org/one'
    }
  ],
  tipo: 'taller',
  participante_pseudonimo: 'Artista',
  registration: { ...registration, url: 'https://example.org/legacy' }
}

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('ActivityItem', () => {
  test('shows one timed range below the title and its CTA directly below', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(
      <ActivityItem activity={baseActivity} isEditionPast={false} />
    )
    const listItem = container.querySelector('li')!
    expect(listItem.textContent).toContain('14:00hrs a 15:30hrs')
    expect(listItem.querySelector('a')?.getAttribute('href')).toBe(
      'https://example.org/one'
    )
    expect(container.querySelector('article > a')).toBeNull()
    expect(container.textContent).not.toContain('Inscripciones abiertas hasta el')
    expect(container.textContent).not.toContain('2026-09-05')
  })

  test('labels multiple timed and untimed blocks and uses the URL for each occurrence', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(
      <ActivityItem
        activity={{
          ...baseActivity,
          ocurrencias: [
            baseActivity.ocurrencias[0],
            {
              id: 2,
              fecha: '2026-09-05',
              hora_inicio: null,
              duracion_minutos: null,
              registration_url: 'https://example.org/two'
            }
          ]
        }}
        isEditionPast={false}
      />
    )
    expect(screen.getByText('Bloque 1: 14:00hrs a 15:30hrs')).toBeDefined()
    expect(screen.getByText('Bloque 2:')).toBeDefined()
    expect(Array.from(container.querySelectorAll('li a')).map((a) => a.getAttribute('href'))).toEqual([
      'https://example.org/one',
      'https://example.org/two'
    ])
  })

  test('shows only the CTA for a single untimed block and hides it without an occurrence URL', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const untimed = {
      ...baseActivity,
      ocurrencias: [
        {
          id: 3,
          fecha: '2026-09-05',
          hora_inicio: null,
          duracion_minutos: null,
          registration_url: 'https://example.org/untimed'
        }
      ]
    }
    const { rerender, container } = render(
      <ActivityItem activity={untimed} isEditionPast={false} />
    )
    expect(container.querySelector('li')?.textContent).toBe('Inscríbete')
    rerender(
      <ActivityItem
        activity={{ ...untimed, ocurrencias: [{ ...untimed.ocurrencias[0], registration_url: null }] }}
        isEditionPast={false}
      />
    )
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })

  test('keeps registration CTAs hidden during server render and when outside the shared window', () => {
    expect(renderToString(<ActivityItem activity={baseActivity} isEditionPast={false} />)).not.toContain('Inscríbete')
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T17:30:00.001Z'))
    render(<ActivityItem activity={baseActivity} isEditionPast={false} />)
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })

  test('shows title and details without restoring the removed schedule list', () => {
    const { container } = render(
      <ActivityItem
        activity={{ ...baseActivity, descripcion: 'Aprende técnicas', ubicacion: 'Sala A' }}
        isEditionPast={false}
      />
    )
    expect(screen.getByText('Taller')).toBeDefined()
    expect(container.querySelector('details')).not.toBeNull()
    expect(container.querySelector('time')).toBeNull()
    expect(screen.queryByText('Horarios')).toBeNull()
    expect(screen.queryByText('Fecha y horario por confirmar')).toBeNull()
  })
})
