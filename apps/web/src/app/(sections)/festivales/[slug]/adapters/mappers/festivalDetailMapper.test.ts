import { describe, expect, test } from 'bun:test'
import { getPosterUrl } from '@frijolmagico/utils/cdn'

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
      catalogo_slug: 'artista-ejemplo',
      rrss: null
    },
    {
      pseudonimo: 'Colectivo X',
      disciplina_slug: 'manualidades',
      catalogo_slug: null,
      rrss: JSON.stringify({ instagram: 'https://instagram.com/colectivox' })
    }
  ],
  actividades: [
    {
      titulo: 'Taller',
      descripcion: 'Taller de prueba',
      ubicacion: 'Sala A',
      tipo: 'taller',
      ocurrencias: [
        { fecha: '2025-10-03', hora_inicio: '18:00', duracion_minutos: 60 }
      ],
      participante_pseudonimo: 'Artista Ejemplo',
      catalogo_slug: 'artista-ejemplo',
      avatar_url: 'artistas/artista-ejemplo/avatar.webp',
      rrss: '{"instagram":"https://instagram.com/artista"}',
      correo: 'artista@example.org'
    }
  ]
}

describe('mapFestivalDetail', () => {
  test('resolves a relative poster key to the public CDN URL', () => {
    const key = 'festivales/poster.webp'
    const result = mapFestivalDetail({
      ...baseRaw,
      poster_url: key
    } as FestivalDetail)

    expect(result.poster_url).toBe(getPosterUrl(key))
  })

  test('preserves an absolute HTTP poster URL', () => {
    const url = 'https://example.org/poster.webp'
    const result = mapFestivalDetail({
      ...baseRaw,
      poster_url: url
    } as FestivalDetail)

    expect(result.poster_url).toBe(url)
  })

  test('keeps a null poster URL', () => {
    const result = mapFestivalDetail({
      ...baseRaw,
      poster_url: null
    } as FestivalDetail)

    expect(result.poster_url).toBeNull()
  })

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

  test('maps activity artist avatar only when an active catalog profile is present', () => {
    const result = mapFestivalDetail({
      ...baseRaw,
      actividades: [
        {
          ...baseRaw.actividades[0],
          catalogo_slug: 'artista-ejemplo',
          avatar_url: 'artistas/artista-ejemplo/avatar.webp',
          rrss: '{"instagram":"https://instagram.com/artista"}',
          correo: 'artista@example.org'
        },
        {
          ...baseRaw.actividades[0],
          catalogo_slug: null,
          avatar_url: 'artistas/sin-catalogo/avatar.webp',
          rrss: '{"facebook":"https://facebook.com/artista"}',
          correo: 'sin-catalogo@example.org'
        }
      ]
    } as FestivalDetail)

    expect(result.actividades[0]).toMatchObject({
      catalogo_slug: 'artista-ejemplo',
      avatar_url: expect.stringContaining('artistas/artista-ejemplo/avatar.webp'),
      rrss: '{"instagram":"https://instagram.com/artista"}',
      correo: 'artista@example.org'
    })
    expect(result.actividades[1]).toMatchObject({
      catalogo_slug: null,
      avatar_url: null,
      rrss: '{"facebook":"https://facebook.com/artista"}',
      correo: 'sin-catalogo@example.org'
    })
  })

  test('preserves configured registration even when its window is inactive', () => {
    const registration = {
      url: 'https://example.org/inscripcion',
      start_at: '2020-01-01T00:00:00.000Z',
      end_at: '2020-01-02T00:00:00.000Z'
    }
    const result = mapFestivalDetail({
      ...baseRaw,
      actividades: [{ ...baseRaw.actividades[0], registration }]
    } as FestivalDetail)

    expect(result.actividades[0].registration).toEqual(registration)
  })

  test('normalizes missing registration to null without changing music type', () => {
    const result = mapFestivalDetail({
      ...baseRaw,
      actividades: [
        { ...baseRaw.actividades[0], registration: null },
        { ...baseRaw.actividades[0], tipo: 'musica' }
      ]
    } as FestivalDetail)

    expect(
      result.actividades.map(({ tipo, registration }) => ({
        tipo,
        registration
      }))
    ).toEqual([
      { tipo: 'taller', registration: null },
      { tipo: 'musica', registration: null }
    ])
  })

  test('preserves occurrence identity, URLs and nullable time while sorting dated blocks', () => {
    const result = mapFestivalDetail({
      ...baseRaw,
      actividades: [
        { ...baseRaw.actividades[0], ocurrencias: [
          { id: 3, fecha: '2025-10-05', hora_inicio: '11:00', duracion_minutos: 30, registration_url: 'https://example.org/three' },
          { id: 2, fecha: '2025-10-03', hora_inicio: '18:00', duracion_minutos: 60, registration_url: 'https://example.org/two' },
          { id: 1, fecha: '2025-10-03', hora_inicio: '09:00', duracion_minutos: 45, registration_url: 'https://example.org/one' },
          { id: 4, fecha: '2025-10-03', hora_inicio: null, duracion_minutos: null, registration_url: null }
        ] },
        { ...baseRaw.actividades[0], ocurrencias: [] }
      ]
    } as FestivalDetail)

    expect(result.actividades[0].ocurrencias.map(({ id, fecha, hora_inicio }) => `${id} ${fecha} ${hora_inicio ?? 'untimed'}`)).toEqual([
      '1 2025-10-03 09:00', '2 2025-10-03 18:00', '4 2025-10-03 untimed', '3 2025-10-05 11:00'
    ])
    expect(result.actividades[0].ocurrencias[0].registration_url).toBe('https://example.org/one')
    expect(result.actividades[0].ocurrencias[2].duracion_minutos).toBeNull()
    expect(result.actividades[1].ocurrencias).toEqual([])
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
