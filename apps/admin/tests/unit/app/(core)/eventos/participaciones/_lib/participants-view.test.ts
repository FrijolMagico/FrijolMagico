import { describe, expect, test } from 'bun:test'
import {
  buildParticipantRows,
  buildParticipantRowsFromProjection,
  filterParticipantRows,
  getParticipantKey
} from '@/core/eventos/participaciones/_lib/participants-view'

describe('participants-view', () => {
  test('builds aggregated participant rows', () => {
    const rows = buildParticipantRows(
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
          artistaPseudonimo: 'Ana'
        }
      ],
      [
        {
          id: '2',
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
        }
      ]
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]?.actividades).toHaveLength(1)
    expect(rows[0]?.exposicion?.estado).toBe('confirmado')
  })

  test('filters rows by search and status', () => {
    const rows = buildParticipantRows(
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
          artistaPseudonimo: 'Ana'
        },
        {
          id: '3',
          artistaId: '11',
          agrupacionId: null,
          eventoEdicionId: '3',
          disciplinaId: '4',
          modoIngresoId: '1',
          puntaje: null,
          estado: 'cancelado',
          notas: null,
          postulacionId: null,
          participanteId: '100',
          createdAt: '',
          updatedAt: '',
          artistaPseudonimo: 'Beto'
        }
      ],
      []
    )

    const result = filterParticipantRows(rows, {
      search: 'ana',
      estado: 'confirmado'
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.artistaPseudonimo).toBe('Ana')
  })

  test('keeps SQL projection ordering when hydrating current page rows', () => {
    const rows = buildParticipantRowsFromProjection(
      [
        {
          participationId: '2',
          key: getParticipantKey('11', null),
          artistaId: '11',
          agrupacionId: null,
          artistaNombre: 'Beto Gómez',
          artistaPseudonimo: 'Beto',
          artistaFoto: null,
          artistaEstadoSlug: 'activo',
          agrupacionNombre: null
        },
        {
          participationId: '1',
          key: getParticipantKey('10', null),
          artistaId: '10',
          agrupacionId: null,
          artistaNombre: 'Ana Torres',
          artistaPseudonimo: 'Ana',
          artistaFoto: null,
          artistaEstadoSlug: 'activo',
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
          participanteId: '1',
          createdAt: '',
          updatedAt: '',
          artistaPseudonimo: 'Ana'
        },
        {
          id: '2',
          artistaId: '11',
          agrupacionId: null,
          eventoEdicionId: '3',
          disciplinaId: '4',
          modoIngresoId: '1',
          puntaje: null,
          estado: 'confirmado',
          notas: null,
          postulacionId: null,
          participanteId: '2',
          createdAt: '',
          updatedAt: '',
          artistaPseudonimo: 'Beto'
        }
      ],
      []
    )

    expect(rows.map((row) => row.key)).toEqual(['artista:11', 'artista:10'])
  })
})
