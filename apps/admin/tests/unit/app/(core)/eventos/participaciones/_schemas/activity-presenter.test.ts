import { describe, expect, test } from 'bun:test'
import {
  activityFormSchema,
  parseActivityPresenterDatabaseValues
} from '@/core/eventos/participaciones/_schemas/activity.schema'

const validTalk = {
  participantType: 'artista',
  tipoActividadId: 2,
  modoIngresoId: 1,
  notas: '',
  estado: 'seleccionado',
  puntaje: null,
  pseudonimoId: null,
  entity: { artistaId: 1, agrupacionId: null, bandaId: null },
  detail: {
    titulo: 'Charla',
    descripcion: '',
    duracionMinutos: null,
    cupos: null,
    horaInicio: '',
    ubicacion: '',
    presenterMode: 'none',
    presenterNombre: '',
    presenterArtistaId: null,
    presenterPseudonimoId: null
  },
  occurrences: [{ date: '2026-06-12', startTime: '', durationMinutes: null }]
}

describe('activity presenter validation', () => {
  test('accepts a free presenter name for a talk', () => {
    const result = activityFormSchema.safeParse({
      ...validTalk,
      detail: { ...validTalk.detail, presenterMode: 'name', presenterNombre: '  Ada Lovelace  ' }
    })
    expect(result.success).toBe(true)
  })

  test('requires a name or a complete artist and pseudonym selection', () => {
    expect(activityFormSchema.safeParse({
      ...validTalk,
      detail: { ...validTalk.detail, presenterMode: 'name' }
    }).success).toBe(false)
    expect(activityFormSchema.safeParse({
      ...validTalk,
      detail: { ...validTalk.detail, presenterMode: 'artist', presenterArtistaId: 10 }
    }).success).toBe(false)
  })

  test('rejects presenters on non-talk activities and for bands', () => {
    expect(activityFormSchema.safeParse({
      ...validTalk,
      tipoActividadId: 1,
      detail: { ...validTalk.detail, presenterMode: 'name', presenterNombre: 'Ada' }
    }).success).toBe(false)
    expect(activityFormSchema.safeParse({
      ...validTalk,
      participantType: 'banda',
      tipoActividadId: 3,
      entity: { artistaId: null, agrupacionId: null, bandaId: 2 },
      detail: { ...validTalk.detail, presenterMode: 'name', presenterNombre: 'Ada' }
    }).success).toBe(false)
  })

  test('server parser rejects malformed links and non-talk presenter values', () => {
    expect(() => parseActivityPresenterDatabaseValues({
      presenterNombre: null,
      presenterArtistaId: 10,
      presenterPseudonimoId: null
    }, true)).toThrow()
    expect(() => parseActivityPresenterDatabaseValues({
      presenterNombre: 'Ada',
      presenterArtistaId: null,
      presenterPseudonimoId: null
    }, false)).toThrow('Solo las charlas pueden tener presentador')
    expect(parseActivityPresenterDatabaseValues({}, true)).toEqual({
      presenterNombre: null,
      presenterArtistaId: null,
      presenterPseudonimoId: null
    })
  })
})
