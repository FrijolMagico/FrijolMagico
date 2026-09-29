import { describe, expect, mock, test } from 'bun:test'
import { parseActivityOccurrencesInput } from '@/core/eventos/participaciones/_schemas/activity.schema'

let resolvedType = { id: 1, slug: 'taller' }
let insertCalls = 0

const tx = {
  query: {
    editionParticipation: {
      findFirst: async () => ({ id: 11, edicionId: 7 })
    },
    activityType: {
      findFirst: async () => resolvedType
    }
  },
  insert: () => {
    insertCalls += 1
    throw new Error('Unexpected database insert')
  }
}
const db = {
  transaction: async (callback: (transaction: typeof tx) => Promise<void>) =>
    callback(tx)
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({
  requireAuth: async () => ({ user: { id: 'admin-1' } })
}))
mock.module('next/cache', () => ({ updateTag: mock(() => {}) }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort: mock(async () => {})
}))

const { createActivityAction } = await import(
  '@/core/eventos/participaciones/_actions/activities/create-activity.action'
)

const payload = {
  participation: {
    edicionId: 7,
    artistaId: 4,
    agrupacionId: null,
    bandaId: null,
    notas: null
  },
  activity: {
    tipoActividadId: 1,
    postulacionId: null,
    modoIngresoId: 1,
    puntaje: null,
    estado: 'seleccionado',
    notas: null
  },
  detail: {
    titulo: 'Taller',
    descripcion: null,
    duracionMinutos: null,
    ubicacion: null,
    horaInicio: null,
    cupos: null
  }
} as const

describe('createActivityAction occurrence requirements', () => {
  test('accepts an untimed date for workshops, talks and music', () => {
    for (const type of ['taller', 'charla', 'musica']) {
      expect(parseActivityOccurrencesInput([{ date: '2026-09-05' }], type)).toEqual([
        { date: '2026-09-05' }
      ])
    }
  })

  test('rejects a date for a type whose model cannot store occurrences', () => {
    expect(() =>
      parseActivityOccurrencesInput([{ date: '2026-09-05' }], 'teatro')
    ).toThrow('no se puede crear o editar')
  })

  test('rejects a schedulable activity without a date before inserting rows', async () => {
    resolvedType = { id: 1, slug: 'taller' }
    insertCalls = 0
    const result = await createActivityAction({ ...payload, occurrences: [] })

    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toContain('al menos una fecha')
    expect(insertCalls).toBe(0)
  })

  test('rejects music activities without a date before inserting rows', async () => {
    resolvedType = { id: 3, slug: 'musica' }
    insertCalls = 0
    const result = await createActivityAction({ ...payload, occurrences: [] })

    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toContain('al menos una fecha')
    expect(insertCalls).toBe(0)
  })
})
