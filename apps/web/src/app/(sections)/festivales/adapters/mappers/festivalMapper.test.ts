import { describe, expect, test } from 'bun:test'
import { getPosterUrl } from '@frijolmagico/utils/cdn'

import { mapFestivalEdicion } from './festivalMapper'

import type { FestivalEdicion } from '../../types/festival'

const baseRaw: FestivalEdicion = {
  evento: {
    evento_id: 1,
    nombre: 'Festival Frijol Mágico',
    slug: 'frijol-magico',
    edicion: 'XV',
    edicion_nombre: 'Edición XV',
    edicion_slug: 'edicion-15-1',
    poster_url: null,
    dias: []
  },
  resumen: {
    total_participantes: { exponentes: 0, talleres: 0, charlas: 0, musica: 0 },
    por_disciplina: {}
  }
}

describe('mapFestivalEdicion poster URL', () => {
  test('resolves a relative poster key to the public CDN URL', () => {
    const key = 'festivales/poster.webp'
    const result = mapFestivalEdicion({
      ...baseRaw,
      evento: { ...baseRaw.evento, poster_url: key }
    })

    expect(result.evento.poster_url).toBe(getPosterUrl(key))
  })

  test('preserves an absolute HTTP poster URL', () => {
    const url = 'https://example.org/poster.webp'
    const result = mapFestivalEdicion({
      ...baseRaw,
      evento: { ...baseRaw.evento, poster_url: url }
    })

    expect(result.evento.poster_url).toBe(url)
  })

  test('keeps a null poster URL', () => {
    expect(mapFestivalEdicion(baseRaw).evento.poster_url).toBeNull()
  })
})
