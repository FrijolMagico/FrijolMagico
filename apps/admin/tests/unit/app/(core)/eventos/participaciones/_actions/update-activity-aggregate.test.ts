import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { participations } from '@frijolmagico/database/schema'

let action: typeof import('../../../../../../../src/app/(core)/eventos/participaciones/_actions/activities/update-activity-aggregate.action').updateActivityAggregateAction
let failAt: string | null
let parentEditionId = 7
let activityTypeSlug = 'taller'
let activityExists = true
let activityParticipationId = 11
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
  return 'unknown'
}

function createHarness() {
  const tx = {
    query: {
      participationActivity: {
        findFirst: async () =>
          activityExists
            ? {
                id: 22,
                participacionId: activityParticipationId,
                tipoActividadId: 1
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
      values: (values: Record<string, unknown>) => ({
        onConflictDoUpdate: async () => {
          const name = tableName(table)
          operations.push(`${name}:upsert`)
          writes.push({ table: name, values })
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
    endTime: '12:00'
  }
}

beforeEach(async () => {
  failAt = null
  parentEditionId = 7
  activityTypeSlug = 'taller'
  activityExists = true
  activityParticipationId = 11
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

  test('rejects forged music registration and clears registration when becoming music', async () => {
    activityTypeSlug = 'musica'
    const rejected = await action(input)
    expect(rejected.success).toBe(false)
    expect(operations).toEqual([])
    const cleared = await action({ ...input, registration: undefined })
    expect(cleared.success).toBe(true)
    expect(operations).toContain('registration:delete')
    expect(operations).toContain('activity:update')
  })

  test('normalizes band activity to music and clears absent registration', async () => {
    activityTypeSlug = 'musica'
    const result = await action({
      ...input,
      participation: { ...input.participation, artistaId: null, bandaId: 4 },
      registration: null
    })
    expect(result.success).toBe(true)
    expect(
      writes.find((write) => write.table === 'activity')?.values.tipoActividadId
    ).toBe(3)
    expect(operations).toContain('registration:delete')
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
