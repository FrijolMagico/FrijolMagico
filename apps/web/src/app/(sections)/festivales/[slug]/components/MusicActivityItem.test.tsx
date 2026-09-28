import { describe, expect, test } from 'bun:test'
import { render, screen } from '@testing-library/react'

import { MusicActivityItem } from './MusicActivityItem'

import type { FestivalActivity } from '../../types/festival'

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

describe('MusicActivityItem', () => {
  test('links to the catalog profile before social and email contacts', () => {
    render(
      <MusicActivityItem
        activity={{
          ...activity,
          catalogo_slug: 'banda-x',
          avatar_url: 'https://example.org/avatar.jpg',
          rrss: '{"instagram":"https://instagram.com/bandax"}',
          correo: 'banda@example.org'
        }}
      />
    )

    expect(screen.getByRole('link', { name: 'Ver perfil de Banda X' }).getAttribute('href')).toBe(
      '/catalogo/banda-x'
    )
  })

  test('uses the valid Instagram or later valid social contact', () => {
    const { rerender } = render(
      <MusicActivityItem
        activity={{
          ...activity,
          rrss: '{"instagram":"https://instagram.com/bandax","web":"https://example.org"}'
        }}
      />
    )
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://instagram.com/bandax'
    )

    rerender(
      <MusicActivityItem
        activity={{
          ...activity,
          rrss: '{"instagram":"javascript:alert(1)","web":"https://example.org/bandax"}'
        }}
      />
    )
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://example.org/bandax'
    )
  })

  test('uses valid email or renders a plain pseudonym when no contact is valid', () => {
    const { rerender } = render(
      <MusicActivityItem activity={{ ...activity, correo: 'banda@example.org' }} />
    )
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'mailto:banda@example.org'
    )

    rerender(
      <MusicActivityItem
        activity={{
          ...activity,
          rrss: '{invalid',
          correo: 'bad email'
        }}
      />
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Banda X').tagName).toBe('SPAN')
  })
})
