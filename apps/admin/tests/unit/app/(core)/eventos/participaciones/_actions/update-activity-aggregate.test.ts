import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { participations } from '@frijolmagico/database/schema'

let action: typeof import('../../../../../../../src/app/(core)/eventos/participaciones/_actions/activities/update-activity-aggregate.action').updateActivityAggregateAction
let failAt: string | null
let parentEditionId = 7
let activityTypeSlug = 'taller'
let activityExists = true
let activityParticipationId = 11
let storedSessions: { id?: number; url?: string | null; date: string; startTime: string | null; durationMinutes: number | null }[] = []
let invalidations: string[]
let committed = false
let operations: string[]
let stagedMutations: string[]
let committedState: string[]
let writes: { table: string; values: Record<string, unknown> }[]

const tables = participations
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  invalidations.push(tag)
})
const revalidateWebCacheBestEffort = mock(async ({ tag }: { tag: string }) => {
  expect(committed).toBe(true)
  invalidations.push(tag)
})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))

function tableName(table: unknown) {
  if (table === tables.editionParticipation) return 'participation'
  if (table === tables.participationActivity) return 'activity'
  if (table === tables.activity) return 'detail'
  if (table === tables.activityRegistration) return 'registration'
  if (table === tables.activityOccurrence) return 'occurrence'
  return 'unknown'
}

function createHarness() {
  const tx = {
    select: () => ({
      from: () => ({
        where: () => ({ limit: async () => [{ id: 41 }] })
      })
    }),
    query: {
      activity: { findFirst: async () => ({ id: 33 }) },
      activityOccurrence: { findMany: async () => storedSessions },
      participationActivity: {
        findFirst: async () =>
          activityExists
            ? {
                id: 22,
                participacionId: activityParticipationId,
                tipoActividadId: 1,
                pseudonimoId: 41
              }
            : undefined
      },
      editionParticipation: {
        findFirst: async () => ({ id: 11, edicionId: parentEditionId })
      },
      activityType: {
        findFirst: async () => ({
          id: activityTypeSlug === 'musica' ? 3 : 1,
          slug: activityTypeSlug
        })
      }
    },
    update: (table: unknown) => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          const name = tableName(table)
          operations.push(`${name}:update`)
          writes.push({ table: name, values })
          stagedMutations.push(`${name}:update`)
          if (failAt === name) throw new Error(`failed ${name}`)
          return values
        }
      })
    }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown> | Record<string, unknown>[]) => ({
        then: (resolve: (value: unknown) => unknown) => {
          const name = tableName(table)
          operations.push(`${name}:insert`)
          writes.push(...(Array.isArray(values) ? values : [values]).map((row) => ({ table: name, values: row })))
          stagedMutations.push(`${name}:insert`)
          if (failAt === name) throw new Error(`failed ${name}`)
          return Promise.resolve(resolve([]))
        },
        onConflictDoUpdate: async () => {
          const name = tableName(table)
          operations.push(`${name}:upsert`)
          writes.push({ table: name, values: Array.isArray(values) ? values[0] : values })
          stagedMutations.push(`${name}:upsert`)
          if (failAt === name) throw new Error(`failed ${name}`)
          return values
        }
      })
    }),
    delete: (table: unknown) => ({
      where: async () => {
        const name = tableName(table)
        operations.push(`${name}:delete`)
        stagedMutations.push(`${name}:delete`)
        if (failAt === name) throw new Error(`failed ${name}`)
      }
    })
  }
  const db = {
    transaction: async (run: (transaction: typeof tx) => Promise<void>) => {
      operations = []
      stagedMutations = []
      committed = false
      await run(tx)
      committedState = stagedMutations
      committed = true
    }
  }
  return db
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db: createHarness() }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort
}))

const initialSchedule = [{ date: '2026-06-12', startTime: '11:00', durationMinutes: 60 }]

const input = {
  editionId: 7,
  participation: {
    id: 11,
    edicionId: 7,
    artistaId: 5,
    bandaId: null,
    agrupacionId: null
  },
  activity: {
    id: 22,
    participacionId: 11,
    tipoActividadId: 1,
    modoIngresoId: 2,
    estado: 'seleccionado',
    puntaje: null,
    notas: ''
  },
  detail: {
    titulo: 'Taller actualizado',
    descripcion: '',
    duracionMinutos: 60,
    ubicacion: 'Sala',
    horaInicio: '10:00',
    cupos: 20
  },
  registration: {
    url: 'https://example.org/register',
    startDate: '2026-06-01',
    startTime: '10:00',
    endDate: '2026-06-01',
    endTime: '12:00',
    registrationEnabled: true
  }
}

beforeEach(async () => {
  failAt = null
  parentEditionId = 7
  activityTypeSlug = 'taller'
  activityExists = true
  activityParticipationId = 11
  storedSessions = [{
    id: 44,
    url: null,
    date: '2026-06-12',
    startTime: '11:00',
    durationMinutes: 60
  }]
  invalidations = []
  committed = false
  operations = []
  stagedMutations = []
  committedState = ['prior-state']
  writes = []
  mock.clearAllMocks()
  ;({ updateActivityAggregateAction: action } =
    await import('../../../../../../../src/app/(core)/eventos/participaciones/_actions/activities/update-activity-aggregate.action'))
})

describe('updateActivityAggregateAction', () => {
  test('updates activity, upserts missing detail and registration in one transaction', async () => {
    const result = await action(input)
    expect(result.success).toBe(true)
    expect(operations).toEqual([
      'participation:update',
      'activity:update',
      'detail:upsert',
      'registration:upsert'
    ])
    expect(
      writes.find((write) => write.table === 'activity')?.values.tipoActividadId
    ).toBe(1)
    expect(
      writes.find((write) => write.table === 'detail')?.values.titulo
    ).toBe('Taller actualizado')
    expect(
      writes.find((write) => write.table === 'registration')?.values
    ).toMatchObject({
      url: 'https://example.org/register',
      startAt: '2026-06-01T14:00:00.000Z',
      endAt: '2026-06-01T16:00:00.000Z'
    })
    expect(invalidations).toEqual([
      'participaciones:edicion:7',
      'actividades:participacion:11',
      'festivales',
      'eventos',
      'ediciones',
      'artistas:detalle',
      'festivales',
      'eventos',
      'ediciones'
    ])
  })

  test('rejects edition and activity ownership mismatches before mutations', async () => {
    parentEditionId = 8
    const wrongEdition = await action(input)
    expect(wrongEdition.success).toBe(false)
    expect(operations).toEqual([])
    parentEditionId = 7
    activityParticipationId = 12
    const wrongParticipation = await action(input)
    expect(wrongParticipation.success).toBe(false)
    expect(operations).toEqual([])
    expect(invalidations).toEqual([])
  })

  test('allows music updates with occurrences while rejecting unsupported types', async () => {
    activityTypeSlug = 'musica'
    const music = await action({ ...input, registration: null })
    expect(music.success).toBe(true)
    expect(operations).not.toContain('occurrence:delete')
    expect(operations).not.toContain('occurrence:insert')

    activityTypeSlug = 'teatro'
    operations = []
    const unsupported = await action({ ...input, registration: null })
    expect(unsupported.success).toBe(false)
    expect(unsupported.errors?.[0]?.message).toContain('no se puede crear o editar')
    expect(operations).toEqual([])
  })

  test('rejects music updates when the existing activity has no date', async () => {
    activityTypeSlug = 'musica'
    storedSessions = []
    const result = await action({ ...input, registration: null })
    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toContain('al menos una fecha')
    expect(operations).toEqual([])
  })

  test('reconciles additions and removals while preserving occurrences on music transition', async () => {
    const sessions = [
      { date: '2026-06-10', startTime: '09:00', durationMinutes: 45 },
      { date: '2026-06-11', startTime: '10:00', durationMinutes: 60 }
    ]
    expect((await action({ ...input, occurrences: sessions, expectedOccurrences: initialSchedule })).success).toBe(true)
    expect(operations).toContain('occurrence:delete')
    expect(operations).toContain('occurrence:insert')
    expect(writes.filter((write) => write.table === 'occurrence').map((write) => write.values))
      .toEqual(sessions.map((session) => ({
        activityId: 33,
        ...session,
        url: 'https://example.org/register'
      })))
    expect((await action({ ...input, occurrences: [], expectedOccurrences: sessions })).success).toBe(false)
    expect(operations).not.toContain('occurrence:delete')
    expect(operations).not.toContain('occurrence:insert')
    activityTypeSlug = 'musica'
    operations = []
    storedSessions = [{ id: 44, date: sessions[0]!.date, startTime: sessions[0]!.startTime, durationMinutes: sessions[0]!.durationMinutes }]
    const musicTransition = await action({
      ...input,
      registration: null,
      occurrences: sessions,
      expectedOccurrences: storedSessions
    })
    expect(musicTransition.success).toBe(true)
    expect(operations).not.toContain('occurrence:delete')
    expect(operations).toContain('occurrence:insert')
    expect(operations).toContain('registration:delete')
  })

  test('preserves the occurrence ID when only its per-block URL changes', async () => {
    storedSessions = [{
      id: 71,
      url: 'https://example.org/old',
      date: '2026-06-12',
      startTime: '11:00',
      durationMinutes: 60
    }]
    const result = await action({
      ...input,
      occurrences: [{
        id: 71,
        date: '2026-06-13',
        startTime: '12:00',
        durationMinutes: 60,
        url: 'https://example.org/new'
      }],
      expectedOccurrences: [{
        date: '2026-06-12',
        startTime: '11:00',
        durationMinutes: 60,
        url: 'https://example.org/old'
      }]
    })
    expect(result.success).toBe(true)
    expect(operations).toContain('occurrence:update')
    expect(operations).not.toContain('occurrence:delete')
    expect(operations).not.toContain('occurrence:insert')
    expect(writes.find((write) => write.table === 'occurrence')?.values).toMatchObject({
      date: '2026-06-13',
      startTime: '12:00',
      durationMinutes: 60,
      url: 'https://example.org/new'
    })
  })

  test('rejects a stale per-occurrence URL snapshot before any database write', async () => {
    storedSessions = [{
      id: 74,
      url: 'https://example.org/newer',
      date: '2026-06-12',
      startTime: '11:00',
      durationMinutes: 60
    }]
    const result = await action({
      ...input,
      occurrences: [{
        date: '2026-06-12',
        startTime: '11:00',
        durationMinutes: 60,
        url: 'https://example.org/stale'
      }],
      expectedOccurrences: [{
        date: '2026-06-12',
        startTime: '11:00',
        durationMinutes: 60,
        url: 'https://example.org/stale'
      }]
    })
    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toContain('Recargá')
    expect(operations).toEqual([])
    expect(writes).toEqual([])
  })

  test('allows an own URL-only edit with a legacy snapshot that omits the occurrence ID', async () => {
    storedSessions = [{
      id: 75,
      url: 'https://example.org/old',
      date: '2026-06-12',
      startTime: '11:00',
      durationMinutes: 60
    }]
    const result = await action({
      ...input,
      occurrences: [{
        date: '2026-06-12',
        startTime: '11:00',
        durationMinutes: 60,
        url: 'https://example.org/own-edit'
      }],
      expectedOccurrences: [{
        date: '2026-06-12',
        startTime: '11:00',
        durationMinutes: 60,
        url: 'https://example.org/old'
      }]
    })
    expect(result.success).toBe(true)
    expect(operations).toContain('occurrence:update')
    expect(operations).not.toContain('occurrence:delete')
    expect(operations).not.toContain('occurrence:insert')
    expect(writes.find((write) => write.table === 'occurrence')?.values.url).toBe('https://example.org/own-edit')
  })

  test('preserves a newer schedule when an unrelated edit omits occurrences', async () => {
    storedSessions = [{ id: 72, date: '2026-06-12', startTime: '11:00', durationMinutes: 60 }]
    expect((await action(input)).success).toBe(true)
    expect(operations).not.toContain('occurrence:delete')
    expect(storedSessions).toHaveLength(1)
  })

  test('rejects editing a legacy schedulable activity until it has a date', async () => {
    storedSessions = []
    const result = await action(input)
    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toContain('al menos una fecha')
    expect(operations).toEqual([])
  })

  test('rejects stale and unguarded schedule writes before any aggregate mutation', async () => {
    storedSessions = [{ id: 73, date: '2026-06-12', startTime: '11:00', durationMinutes: 60 }]
    const desired = [{ date: '2026-06-13', startTime: '12:00', durationMinutes: 45 }]
    const unguarded = await action({ ...input, occurrences: desired })
    expect(unguarded.success).toBe(false)
    expect(operations).toEqual([])
    const stale = await action({ ...input, occurrences: desired, expectedOccurrences: [] })
    expect(stale.success).toBe(false)
    expect(stale.errors?.[0]?.message).toContain('Recargá')
    expect(operations).toEqual([])
    expect(invalidations).toEqual([])
    expect(committedState).toEqual(['prior-state'])
    const valid = await action({ ...input, occurrences: desired, expectedOccurrences: storedSessions })
    expect(valid.success).toBe(true)
    expect(operations).toContain('occurrence:delete')
  })

  test('omitted band ID on an artist does not clear sessions as music', async () => {
    const { bandaId: _omitted, ...artist } = input.participation
    expect((await action({ ...input, participation: artist })).success).toBe(true)
    expect(operations).not.toContain('occurrence:delete')
    expect(writes.find((write) => write.table === 'activity')?.values.tipoActividadId).toBe(1)
  })

  test('rolls back if replacing sessions fails after aggregate writes', async () => {
    failAt = 'occurrence'
    const result = await action({ ...input, occurrences: [
      { date: '2026-06-10', startTime: '09:00', durationMinutes: 45 }
    ], expectedOccurrences: initialSchedule })
    expect(result.success).toBe(false)
    expect(committed).toBe(false)
    expect(committedState).toEqual(['prior-state'])
    expect(invalidations).toEqual([])
  })

  test('rolls back all mutations and skips cache invalidation after each late failure', async () => {
    for (const failure of [
      'participation',
      'activity',
      'detail',
      'registration'
    ]) {
      failAt = failure
      invalidations = []
      committedState = ['coherent-before']
      const result = await action(input)
      expect(result.success).toBe(false)
      expect(committed).toBe(false)
      expect(committedState).toEqual(['coherent-before'])
      expect(invalidations).toEqual([])
    }
  })
})
