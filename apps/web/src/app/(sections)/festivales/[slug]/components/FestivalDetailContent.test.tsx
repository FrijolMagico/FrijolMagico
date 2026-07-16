import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { JSX, ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'

import { FestivalDetailContent } from './FestivalDetailContent'

import type { FestivalDetail } from '../../types/festival'

mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

mock.module('./FestivalNavigator', () => ({
  FestivalNavigator: async () => null
}))

afterEach(cleanup)

const baseDetail: FestivalDetail = {
  edition_id: 10,
  slug: 'edicion-15-1',
  evento: { nombre: 'Festival Frijol Mágico', slug: 'frijol-magico' },
  edicion_nombre: 'Un Nuevo Germinar',
  numero_edicion: 'XV',
  poster_url: 'https://cdn.frijolmagico.cl/poster.webp',
  dias: [
    {
      fecha: '2025-10-03',
      hora_inicio: '11:00',
      hora_fin: '20:00',
      modalidad: 'presencial',
      lugar: { nombre: 'Casa ULS', direccion: 'Av. Solari 1301' }
    }
  ],
  participantes: [
    {
      pseudonimo: 'Artista Ejemplo',
      disciplina_slug: 'Ilustración',
      catalogo_slug: 'artista-ejemplo'
    }
  ],
  actividades: [
    {
      titulo: 'Taller de Acuarela',
      descripcion: null,
      duracion_minutos: 60,
      ubicacion: 'Sala A',
      hora_inicio: '18:00',
      tipo: 'taller',
      fecha: '2025-10-03',
      participante_pseudonimo: 'Artista Ejemplo'
    }
  ]
}

// Helper: call async component as a function and render the returned JSX
async function renderAsync(
  element: Promise<JSX.Element> | JSX.Element
): Promise<ReturnType<typeof render>> {
  return render(await element)
}

describe('FestivalDetailContent', () => {
  test('renders event name, edition and dates', async () => {
    await renderAsync(FestivalDetailContent({ detail: baseDetail }))

    expect(
      screen.getByRole('heading', { name: /Festival Frijol Mágico/i })
    ).toBeDefined()
    expect(screen.getByText('Un Nuevo Germinar')).toBeDefined()
    expect(screen.getByText('3 de octubre de 2025')).toBeDefined()
  })

  test('renders participants and activities sections', async () => {
    await renderAsync(FestivalDetailContent({ detail: baseDetail }))

    expect(screen.getByText('Participantes')).toBeDefined()
    expect(screen.getByText('Actividades')).toBeDefined()
    expect(screen.getByRole('link', { name: 'Artista Ejemplo' })).toBeDefined()
    expect(screen.getByText('Taller de Acuarela')).toBeDefined()
  })

  test('renders fallback edition name when edicion_nombre is null', async () => {
    const detail: FestivalDetail = {
      ...baseDetail,
      edicion_nombre: null
    }

    await renderAsync(FestivalDetailContent({ detail }))

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('XV')
    expect(heading.textContent).toContain('Festival Frijol Mágico')
  })
})
