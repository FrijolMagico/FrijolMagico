import '../../../../../../test-setup'

import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { JSX, ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'

import { FestivalDetailContent } from './FestivalDetailContent'

import type { FestivalDetail } from '../../types/festival'

mock.module('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: ReactNode } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
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
      catalogo_slug: 'artista-ejemplo',
      rrss: null
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

  test('leaves inactive content and activities without animation markers', async () => {
    const { container } = await renderAsync(
      FestivalDetailContent({ detail: baseDetail })
    )

    expect(container.querySelector('[data-festival-entry]')).toBeNull()
    expect(container.querySelector('[data-spoiler-category]')).toBeNull()
    expect(container.querySelector('[data-spoiler-item]')).toBeNull()
    expect(container.querySelector('[data-spoiler-redaction]')).toBeNull()
    expect(container.querySelector('[data-spoiler-global-toggle]')).toBeNull()
  })

  test('places the navigator slot after participant and activity content in the right column', async () => {
    const { container } = await renderAsync(
      FestivalDetailContent({
        detail: baseDetail,
        navigator: (
          <nav aria-label='Navegación entre ediciones'>Otras ediciones</nav>
        )
      })
    )

    const leftColumn = container.querySelector('aside')
    const rightColumn = container.querySelector('.md\\:col-span-5')
    const navigator = screen.getByRole('navigation', {
      name: 'Navegación entre ediciones'
    })

    expect(leftColumn?.contains(navigator)).toBe(false)
    expect(rightColumn?.contains(navigator)).toBe(true)
    expect(rightColumn?.lastElementChild?.contains(navigator)).toBe(true)
  })

  test('adds spoiler and entry markers only in active animation mode', async () => {
    const { container } = await renderAsync(
      FestivalDetailContent({ detail: baseDetail, animationMode: 'active' })
    )

    expect(
      container.querySelector("[data-festival-entry='header']")
    ).not.toBeNull()
    expect(
      container.querySelector("[data-festival-entry='poster']")
    ).not.toBeNull()
    expect(
      container.querySelector("[data-festival-entry='participants']")
    ).not.toBeNull()
    expect(container.querySelector('[data-spoiler-category]')).not.toBeNull()
    expect(container.querySelector('[data-spoiler-item]')).not.toBeNull()
    expect(container.querySelector('[data-spoiler-text]')).not.toBeNull()
    expect(container.querySelector('[data-spoiler-redaction]')).not.toBeNull()
    expect(
      container
        .querySelector('[data-spoiler-item]')
        ?.getAttribute('data-category-id')
    ).toBe('Ilustración')
  })
})
