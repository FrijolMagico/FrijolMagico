import { describe, expect, test } from 'bun:test'
import { resolvePresenterText } from '@/core/eventos/participaciones/_components/activity-presenter-fields'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import type { ArtistLookup } from '@/core/eventos/participaciones/_types/participations.types'
import {
  activityFormSchema,
  activityPresenterDatabaseValues,
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
    presenterNombre: '',
    presenterArtistaId: null,
    presenterPseudonimoId: null
  },
  occurrences: [{ date: '2026-06-12', startTime: '', durationMinutes: null }]
}

describe('activity presenter validation', () => {
  test('resolves unique exact pseudonyms and fails closed for case-insensitive collisions', () => {
    const artists: ArtistLookup[] = [
      {
        id: 10,
        pseudonym: 'Primary',
        statusId: ARTIST_STATUS.ACTIVE,
        pseudonyms: [
          { id: 101, pseudonym: 'Ada', isPrimary: true },
          { id: 102, pseudonym: 'Lovelace', isPrimary: false }
        ]
      },
      {
        id: 20,
        pseudonym: 'Other',
        statusId: ARTIST_STATUS.ACTIVE,
        pseudonyms: [{ id: 201, pseudonym: 'ADA', isPrimary: true }]
      },
      {
        id: 30,
        pseudonym: 'Cancelled',
        statusId: ARTIST_STATUS.CANCELLED,
        pseudonyms: [{ id: 301, pseudonym: 'Grace', isPrimary: true }]
      }
    ]

    expect(resolvePresenterText('  Lovelace  ', artists)).toEqual({
      type: 'linked', artistId: 10, pseudonymId: 102
    })
    expect(resolvePresenterText(' ada ', artists)).toEqual({
      type: 'free', presenterNombre: 'ada'
    })
    expect(resolvePresenterText('Grace', artists)).toEqual({
      type: 'free', presenterNombre: 'Grace'
    })
    expect(resolvePresenterText('  ', artists)).toEqual({ type: 'none' })
  })

  test('accepts either a free presenter name or a complete artist-pseudonym link', () => {
    expect(activityFormSchema.safeParse({
      ...validTalk,
      detail: { ...validTalk.detail, presenterNombre: '  Ada Lovelace  ' }
    }).success).toBe(true)
    expect(activityFormSchema.safeParse({
      ...validTalk,
      detail: {
        ...validTalk.detail,
        presenterArtistaId: 10,
        presenterPseudonimoId: 21
      }
    }).success).toBe(true)
  })

  test('rejects incomplete or mixed presenter shapes', () => {
    expect(activityFormSchema.safeParse({
      ...validTalk,
      detail: { ...validTalk.detail, presenterNombre: 'Ada', presenterArtistaId: 10 }
    }).success).toBe(false)
    expect(activityFormSchema.safeParse({
      ...validTalk,
      detail: { ...validTalk.detail, presenterArtistaId: 10 }
    }).success).toBe(false)
    expect(activityFormSchema.safeParse({
      ...validTalk,
      detail: { ...validTalk.detail, presenterNombre: '   ' }
    }).success).toBe(true)
  })

  test('rejects presenters on non-talk activities and for bands', () => {
    expect(activityFormSchema.safeParse({
      ...validTalk,
      tipoActividadId: 1,
      detail: { ...validTalk.detail, presenterNombre: 'Ada' }
    }).success).toBe(false)
    expect(activityFormSchema.safeParse({
      ...validTalk,
      participantType: 'banda',
      tipoActividadId: 3,
      entity: { artistaId: null, agrupacionId: null, bandaId: 2 },
      detail: { ...validTalk.detail, presenterNombre: 'Ada' }
    }).success).toBe(false)
  })

  test('maps form presenter data to the mutually exclusive database shape', () => {
    expect(activityPresenterDatabaseValues({
      presenterNombre: '  Ada Lovelace  ',
      presenterArtistaId: null,
      presenterPseudonimoId: null
    }, true)).toEqual({
      presenterNombre: 'Ada Lovelace',
      presenterArtistaId: null,
      presenterPseudonimoId: null
    })
    expect(activityPresenterDatabaseValues({
      presenterNombre: '',
      presenterArtistaId: 10,
      presenterPseudonimoId: 21
    }, true)).toEqual({
      presenterNombre: null,
      presenterArtistaId: 10,
      presenterPseudonimoId: 21
    })
    expect(activityPresenterDatabaseValues({
      presenterNombre: 'Ada',
      presenterArtistaId: null,
      presenterPseudonimoId: null
    }, false)).toEqual({
      presenterNombre: null,
      presenterArtistaId: null,
      presenterPseudonimoId: null
    })
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
