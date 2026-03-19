import { describe, expect, test } from 'bun:test'
import { createPaginatedResponse } from '@/shared/types/pagination'
import { normalizeParticipacionesListQuery } from '@/core/eventos/participaciones/_lib/participaciones-list-query'
import {
  buildParticipantRowsFromProjection,
  getParticipantKey
} from '@/core/eventos/participaciones/_lib/participants-view'

describe('normalizeParticipacionesListQuery', () => {
  test('normalizes participaciones filters for server queries', () => {
    const result = normalizeParticipacionesListQuery({
      page: 2,
      pageSize: 25,
      search: '  ana  ',
      filters: {
        edicionId: '15',
        estado: 'confirmado'
      }
    })

    expect(result).toEqual({
      page: 2,
      pageSize: 25,
      search: 'ana',
      edicionId: '15',
      estado: 'confirmado'
    })
  })
})

describe('participaciones server projection', () => {
  test('builds current page rows from the paginated projection only', () => {
    const rows = buildParticipantRowsFromProjection(
      [
        {
          participationId: '99',
          key: getParticipantKey('10', null),
          artistaId: '10',
          agrupacionId: null,
          artistaNombre: 'Ana Torres',
          artistaPseudonimo: 'Ana',
          artistaFoto: null,
          artistaEstadoSlug: 'activa',
          agrupacionNombre: null
        }
      ],
      [
        {
          id: '1',
          artistaId: '10',
          agrupacionId: null,
          eventoEdicionId: '3',
          disciplinaId: '4',
          modoIngresoId: '1',
          puntaje: null,
          estado: 'confirmado',
          notas: null,
          postulacionId: null,
          participanteId: '99',
          createdAt: '',
          updatedAt: '',
          artistaPseudonimo: 'Ana',
          disciplinaSlug: 'pintura'
        },
        {
          id: '2',
          artistaId: '22',
          agrupacionId: null,
          eventoEdicionId: '3',
          disciplinaId: '8',
          modoIngresoId: '1',
          puntaje: null,
          estado: 'cancelado',
          notas: null,
          postulacionId: null,
          participanteId: '100',
          createdAt: '',
          updatedAt: '',
          artistaPseudonimo: 'Fuera de página',
          disciplinaSlug: 'escultura'
        }
      ],
      [
        {
          id: '5',
          artistaId: '10',
          agrupacionId: null,
          eventoEdicionId: '3',
          tipoActividadId: '7',
          modoIngresoId: '2',
          puntaje: null,
          estado: 'seleccionado',
          notas: null,
          postulacionId: null,
          participanteId: '99',
          createdAt: '',
          updatedAt: '',
          tipoActividadSlug: 'taller'
        },
        {
          id: '6',
          artistaId: '22',
          agrupacionId: null,
          eventoEdicionId: '3',
          tipoActividadId: '9',
          modoIngresoId: '2',
          puntaje: null,
          estado: 'cancelado',
          notas: null,
          postulacionId: null,
          participanteId: '100',
          createdAt: '',
          updatedAt: '',
          tipoActividadSlug: 'charla'
        }
      ]
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]?.key).toBe('artista:10')
    expect(rows[0]?.exposicion?.id).toBe('1')
    expect(rows[0]?.actividades.map((actividad) => actividad.id)).toEqual(['5'])
  })

  test('preserves empty-page metadata when the requested page exceeds results', () => {
    const result = createPaginatedResponse([], {
      total: 10,
      page: 3,
      pageSize: 10
    })

    expect(result).toEqual({
      data: [],
      total: 10,
      page: 3,
      pageSize: 10,
      totalPages: 1
    })
  })
})
