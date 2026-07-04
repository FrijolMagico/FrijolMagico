import { describe, expect, test } from 'bun:test'

import type {
  FestivalActivity,
  FestivalDetail,
  FestivalEvento,
  FestivalParticipant,
  RawFestivalDetail
} from './festival'

describe('Festival types', () => {
  test('FestivalEvento includes edition slug for detail links', () => {
    const evento: FestivalEvento = {
      evento_id: 1,
      nombre: 'Festival Frijol Mágico',
      slug: 'frijol-magico',
      edicion: 'XV',
      edicion_nombre: 'Edición XV',
      edicion_slug: 'edicion-15-1',
      poster_url: 'https://cdn.frijolmagico.cl/poster.webp',
      dias: []
    }

    expect(evento.edicion_slug).toBe('edicion-15-1')
  })

  test('FestivalParticipant shape supports catalog and non-catalog participants', () => {
    const participant: FestivalParticipant = {
      pseudonimo: 'Artista Ejemplo',
      disciplina_slug: 'ilustracion',
      catalogo_slug: 'artista-ejemplo'
    }

    expect(participant.pseudonimo).toBe('Artista Ejemplo')
    expect(participant.disciplina_slug).toBe('ilustracion')
    expect(participant.catalogo_slug).toBe('artista-ejemplo')
  })

  test('FestivalActivity shape includes scheduling and type fields', () => {
    const activity: FestivalActivity = {
      titulo: 'Taller de Acuarela',
      descripcion: 'Un taller introductorio',
      duracion_minutos: 90,
      ubicacion: 'Sala A',
      hora_inicio: '18:00',
      tipo: 'taller',
      fecha: '2025-01-15',
      participante_pseudonimo: 'Artista Ejemplo'
    }

    expect(activity.tipo).toBe('taller')
    expect(activity.fecha).toBe('2025-01-15')
  })

  test('FestivalDetail shape aggregates edition data', () => {
    const detail: FestivalDetail = {
      edition_id: 10,
      slug: 'edicion-15-1',
      evento: { nombre: 'Festival Frijol Mágico', slug: 'frijol-magico' },
      edicion_nombre: 'Edición XV',
      numero_edicion: 'XV',
      poster_url: 'https://cdn.frijolmagico.cl/poster.webp',
      dias: [],
      participantes: [],
      actividades: []
    }

    expect(detail.edition_id).toBe(10)
    expect(detail.evento.slug).toBe('frijol-magico')
  })

  test('RawFestivalDetail wraps JSON result string', () => {
    const raw: RawFestivalDetail = { resultado: '{}' }

    expect(raw.resultado).toBe('{}')
  })
})
