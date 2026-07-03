import { describe, expect, test } from 'bun:test'

import { mapFestivalDetail } from './festivalDetailMapper'

import type { FestivalDetail } from '../../../types/festival'

const baseRaw = {
  edition_id: 10,
  slug: 'edicion-15-1',
  evento: { nombre: 'Festival Frijol Mágico', slug: 'frijol-magico' },
  edicion_nombre: 'Edición XV',
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
      disciplina_slug: 'ilustracion',
      catalogo_slug: 'artista-ejemplo'
    },
    {
      pseudonimo: 'Colectivo X',
      disciplina_slug: 'manualidades',
      catalogo_slug: null
    }
  ],
  actividades: [
    {
      titulo: 'Taller',
      descripcion: 'Taller de prueba',
      duracion_minutos: 60,
      ubicacion: 'Sala A',
      hora_inicio: '18:00',
      tipo: 'taller',
      fecha: '2025-10-03',
      participante_pseudonimo: 'Artista Ejemplo'
    }
  ]
}

describe('mapFestivalDetail', () => {
  test('maps known discipline slugs to labels', () => {
    const result = mapFestivalDetail(baseRaw as unknown as FestivalDetail)

    expect(result.participantes[0].disciplina_slug).toBe('Ilustración')
    expect(result.participantes[1].disciplina_slug).toBe('Manualidades')
  })

  test('keeps unknown discipline slugs when label is missing', () => {
    const raw = {
      ...baseRaw,
      participantes: [
        {
          pseudonimo: 'Nuevo Artista',
          disciplina_slug: 'nueva-disciplina',
          catalogo_slug: null
        }
      ]
    }

    const result = mapFestivalDetail(raw as unknown as FestivalDetail)

    expect(result.participantes[0].disciplina_slug).toBe('nueva-disciplina')
  })

  test('returns the same top-level fields', () => {
    const result = mapFestivalDetail(baseRaw as unknown as FestivalDetail)

    expect(result.edition_id).toBe(10)
    expect(result.slug).toBe('edicion-15-1')
    expect(result.evento.nombre).toBe('Festival Frijol Mágico')
    expect(result.dias).toHaveLength(1)
    expect(result.actividades).toHaveLength(1)
  })
})
