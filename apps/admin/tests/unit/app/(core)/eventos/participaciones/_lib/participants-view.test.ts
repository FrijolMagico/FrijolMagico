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
          id: 1,
          participacionId: 99,
          artistaId: 10,
          agrupacionId: null,
          bandaId: null,
          edicionId: 3,
          disciplinaId: 4,
          modoIngresoId: 1,
          puntaje: null,
          estado: 'confirmado',
          notas: null,
          postulacionId: null,
          artistaNombre: null,
          artistaPseudonimo: 'Ana',
          artistaFoto: null,
          artistaEstadoSlug: null,
          agrupacionNombre: null,
          bandaNombre: null,
          disciplinaSlug: null,
          modoIngresoSlug: null
        }
      ],
      [
        {
          id: 2,
          participacionId: 99,
          artistaId: 10,
          agrupacionId: null,
          bandaId: null,
          edicionId: 3,
          tipoActividadId: 7,
          modoIngresoId: 2,
          puntaje: null,
          estado: 'seleccionado',
          notas: null,
          postulacionId: null,
          artistaNombre: null,
          artistaPseudonimo: null,
          artistaFoto: null,
          artistaEstadoSlug: null,
          agrupacionNombre: null,
          bandaNombre: null,
          tipoActividadSlug: 'taller',
          modoIngresoSlug: null,
          detalle: null
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
          id: 1,
          participacionId: 99,
          artistaId: 10,
          agrupacionId: null,
          bandaId: null,
          edicionId: 3,
          disciplinaId: 4,
          modoIngresoId: 1,
          puntaje: null,
          estado: 'confirmado',
          notas: null,
          postulacionId: null,
          artistaNombre: null,
          artistaPseudonimo: 'Ana',
          artistaFoto: null,
          artistaEstadoSlug: null,
          agrupacionNombre: null,
          bandaNombre: null,
          disciplinaSlug: null,
          modoIngresoSlug: null
        },
        {
          id: 3,
          participacionId: 100,
          artistaId: 11,
          agrupacionId: null,
          bandaId: null,
          edicionId: 3,
          disciplinaId: 4,
          modoIngresoId: 1,
          puntaje: null,
          estado: 'cancelado',
          notas: null,
          postulacionId: null,
          artistaNombre: null,
          artistaPseudonimo: 'Beto',
          artistaFoto: null,
          artistaEstadoSlug: null,
          agrupacionNombre: null,
          bandaNombre: null,
          disciplinaSlug: null,
          modoIngresoSlug: null
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
          participationId: 2,
          edicionId: 3,
          key: getParticipantKey(11, null),
          displayName: 'Beto',
          participantType: 'artista',
          artistaId: 11,
          agrupacionId: null,
          bandaId: null,
          artistaNombre: 'Beto Gómez',
          artistaPseudonimo: 'Beto',
          artistaFoto: null,
          artistaEstadoSlug: 'activo',
          agrupacionNombre: null,
          bandaNombre: null
        },
        {
          participationId: 1,
          edicionId: 3,
          key: getParticipantKey(10, null),
          displayName: 'Ana',
          participantType: 'artista',
          artistaId: 10,
          agrupacionId: null,
          bandaId: null,
          artistaNombre: 'Ana Torres',
          artistaPseudonimo: 'Ana',
          artistaFoto: null,
          artistaEstadoSlug: 'activo',
          agrupacionNombre: null,
          bandaNombre: null
        }
      ],
      [
        {
          id: 1,
          participacionId: 1,
          artistaId: 10,
          agrupacionId: null,
          bandaId: null,
          edicionId: 3,
          disciplinaId: 4,
          modoIngresoId: 1,
          puntaje: null,
          estado: 'confirmado',
          notas: null,
          postulacionId: null,
          artistaNombre: null,
          artistaPseudonimo: 'Ana',
          artistaFoto: null,
          artistaEstadoSlug: null,
          agrupacionNombre: null,
          bandaNombre: null,
          disciplinaSlug: null,
          modoIngresoSlug: null
        },
        {
          id: 2,
          participacionId: 2,
          artistaId: 11,
          agrupacionId: null,
          bandaId: null,
          edicionId: 3,
          disciplinaId: 4,
          modoIngresoId: 1,
          puntaje: null,
          estado: 'confirmado',
          notas: null,
          postulacionId: null,
          artistaNombre: null,
          artistaPseudonimo: 'Beto',
          artistaFoto: null,
          artistaEstadoSlug: null,
          agrupacionNombre: null,
          bandaNombre: null,
          disciplinaSlug: null,
          modoIngresoSlug: null
        }
      ],
      []
    )

    expect(rows.map((row) => row.key)).toEqual(['artista:11', 'artista:10'])
  })
})
