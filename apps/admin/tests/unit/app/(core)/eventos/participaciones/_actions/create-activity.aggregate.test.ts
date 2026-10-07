import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FESTIVALES_CACHE_TAG, FESTIVAL_CRITICAL_CACHE_TAG } from '@frijolmagico/cache-tags'
import { participations } from '@frijolmagico/database/schema'

const updateTag = mock((tag: string) => {
  invalidationCommitStates.push(transactionCommitted)
})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
type WebInvalidation = {
  tag?: string
  mode?: string
  path?: string
  pathType?: string
}
const webInvalidations: WebInvalidation[] = []
const batchCalls: { requests: WebInvalidation[]; context?: string }[] = []
let batchResult: { webRevalidation?: 'swr' | 'immediate' } = {
  webRevalidation: 'swr'
}
let batchPromise: Promise<{ webRevalidation?: 'swr' | 'immediate' }> | null = null
let batchStarted: (() => void) | null = null
const revalidateWebCacheBatch = mock(
  async (
    requests: WebInvalidation[],
    context?: string
  ): Promise<{ webRevalidation?: 'swr' | 'immediate' }> => {
    invalidationCommitStates.push(transactionCommitted)
    batchCalls.push({ requests, context })
    webInvalidations.push(...requests)
    batchStarted?.()
    return batchPromise ? batchPromise : batchResult
  }
)
const committed: { rows: Map<unknown, Record<string, unknown>[]> } = {
  rows: new Map()
}
let currentDb: Record<string, unknown>
let failAt: string | null
let effectiveTypeSlug = 'taller'
let activePseudonymId = 41
let participationExists = true
let typeLookups: unknown[]
let transactionCommitted: boolean
let invalidationCommitStates: boolean[]

const tables = participations

function createHarness() {
  const pending = new Map<unknown, Record<string, unknown>[]>()
  const records = new Map<unknown, Record<string, unknown>[]>([
    [tables.activityType, [{ id: 1, slug: 'taller' }]]
  ])
  transactionCommitted = false
  invalidationCommitStates = []
  typeLookups = []
  const tx = {
    select: () => ({
      from: () => ({
        where: () => ({ limit: async () => [{ id: activePseudonymId }] }),
        innerJoin: () => ({
          where: () => ({ limit: async () => [{ id: activePseudonymId }] })
        })
      })
    }),
    query: {
      editionParticipation: {
        findFirst: async () =>
          participationExists ? { id: 11, edicionId: 7 } : undefined
      },
      activityType: {
        findFirst: async (query: unknown) => {
          typeLookups.push(query)
          return {
            id: effectiveTypeSlug === 'musica' ? 3 : 1,
            slug: effectiveTypeSlug
          }
        }
      }
    },
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown> | Record<string, unknown>[]) => ({
        returning: async () => {
          if (failAt === tableName(table))
            throw new Error(`failed ${tableName(table)}`)
          const rows = pending.get(table) ?? []
          rows.push(...(Array.isArray(values) ? values : [values]))
          pending.set(table, rows)
          return [{ id: table === tables.editionParticipation ? 11 : 22 }]
        },
        then: (resolve: (value: unknown) => unknown) => {
          if (failAt === tableName(table))
            throw new Error(`failed ${tableName(table)}`)
          const rows = pending.get(table) ?? []
          rows.push(...(Array.isArray(values) ? values : [values]))
          pending.set(table, rows)
          return Promise.resolve(resolve([]))
        }
      })
    })
  }
  currentDb = {
    transaction: async (
      callback: (transaction: typeof tx) => Promise<void>
    ) => {
      try {
        await callback(tx)
        for (const [table, rows] of pending) {
          records.set(table, [...(records.get(table) ?? []), ...rows])
        }
        committed.rows = records
        transactionCommitted = true
      } catch (error) {
        throw error
      }
    }
  }
  failAt = null
  return { records, pending }
}

function tableName(table: unknown): string {
  if (table === tables.editionParticipation) return 'participation'
  if (table === tables.participationActivity) return 'activity'
  if (table === tables.activity) return 'detail'
  if (table === tables.activityRegistration) return 'registration'
  if (table === tables.activityOccurrence) return 'occurrence'
  return 'unknown'
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBatch
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: new Proxy(
    {},
    { get: (_, property) => currentDb[property as keyof typeof currentDb] }
  )
}))

const { createActivityAction } =
  await import('@/core/eventos/participaciones/_actions/activities/create-activity.action')

describe('createActivityAction aggregate', () => {
  beforeEach(() => {
    updateTag.mockClear()
    requireAuth.mockClear()
    revalidateWebCacheBatch.mockClear()
    batchCalls.length = 0
    batchResult = { webRevalidation: 'swr' }
    batchPromise = null
    batchStarted = null
    webInvalidations.length = 0
    effectiveTypeSlug = 'taller'
    activePseudonymId = 41
    participationExists = true
    createHarness()
  })

  const payload = (
    registration?: Record<string, string>,
    options: { bandId?: number; typeId?: number } = {}
  ) => ({
    participation: {
      edicionId: 7,
      artistaId: options.bandId ? null : 4,
      agrupacionId: null,
      bandaId: options.bandId ?? null,
      notas: null
    },
    activity: {
      tipoActividadId: options.typeId ?? 1,
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
    },
    ...(registration ? { registration: { ...registration, registrationEnabled: true } } : {})
  })

  test('creates an eligible activity and registration atomically', async () => {
    const harness = createHarness()
    const result = await createActivityAction({
      ...payload({
        url: 'https://registro.example/form',
        startDate: '2026-06-10',
        startTime: '10:00',
        endDate: '2026-06-10',
        endTime: '11:00'
      }),
      occurrences: [{ date: '2026-06-10', startTime: '10:00', durationMinutes: 60 }]
    } as never)

    expect(result.success).toBe(true)
    expect(harness.pending.get(tables.activityRegistration)).toEqual([
      {
        participationActivityId: 22,
        url: 'https://registro.example/form',
        startAt: '2026-06-10T14:00:00.000Z',
        endAt: '2026-06-10T15:00:00.000Z'
      }
    ])
    expect(transactionCommitted).toBe(true)
  })

  test('persists a presenter for talks and rejects it for non-talk activities', async () => {
    let harness = createHarness()
    effectiveTypeSlug = 'charla'
    const presenter = await createActivityAction({
      ...payload(),
      detail: {
        ...payload().detail,
        presenterArtistaId: 18,
        presenterPseudonimoId: 29
      },
      occurrences: [{ date: '2026-06-10', startTime: '', durationMinutes: null }]
    } as never)
    expect(presenter.success).toBe(true)
    expect(harness.pending.get(tables.activity)?.[0]).toMatchObject({
      presenterNombre: null,
      presenterArtistaId: 18,
      presenterPseudonimoId: 29
    })

    effectiveTypeSlug = 'taller'
    harness = createHarness()
    const rejected = await createActivityAction({
      ...payload(),
      detail: { ...payload().detail, presenterNombre: 'Ada' },
      occurrences: [{ date: '2026-06-10', startTime: '', durationMinutes: null }]
    } as never)
    expect(rejected.success).toBe(false)
    expect(harness.pending.has(tables.activity)).toBe(false)
  })

  test('persists distinct pseudonyms for multiple activities by the same artist', async () => {
    const harness = createHarness()
    const occurrences = [{ date: '2026-06-10' }]
    const first = await createActivityAction({
      ...payload(),
      pseudonimoId: 41,
      occurrences
    } as never)
    activePseudonymId = 42
    const second = await createActivityAction({
      ...payload(),
      pseudonimoId: 42,
      occurrences
    } as never)

    expect(first.success).toBe(true)
    expect(second.success).toBe(true)
    expect(harness.pending.get(tables.participationActivity)?.map((row) => row.pseudonimoId)).toEqual([41, 42])
    expect(harness.pending.get(tables.participationActivity)?.every((row) => row.participacionId === 11)).toBe(true)
  })

  test('creates the activity without a registration row when configuration is absent', async () => {
    const harness = createHarness()
    const result = await createActivityAction({
      ...payload(),
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(true)
    expect(harness.pending.has(tables.activityRegistration)).toBe(false)
    expect(harness.pending.get(tables.participationActivity)).toHaveLength(1)
    expect(transactionCommitted).toBe(true)
  })

  test('accepts an artist payload with omitted band ID and retains its sessions', async () => {
    const harness = createHarness()
    const { bandaId: _omitted, ...artist } = payload().participation
    const sessions = [{ date: '2026-06-10', startTime: '09:00', durationMinutes: 45 }]
    const result = await createActivityAction({
      ...payload(), participation: artist, occurrences: sessions
    } as never)
    expect(result.success).toBe(true)
    expect(harness.records.get(tables.activityOccurrence)).toEqual([
      { activityId: 22, ...sessions[0] }
    ])
    expect(harness.records.get(tables.participationActivity)?.[0]?.tipoActividadId).toBe(1)
  })

  test('persists multiple sessions on the detail row in the aggregate transaction', async () => {
    const harness = createHarness()
    const occurrences = [
      { date: '2026-06-10', startTime: '09:00', durationMinutes: 45 },
      { date: '2026-06-11', startTime: '10:00', durationMinutes: 60 }
    ]
    const result = await createActivityAction({ ...payload(), occurrences } as never)
    expect(result.success).toBe(true)
    expect(harness.records.get(tables.activityOccurrence)).toEqual(
      occurrences.map((occurrence) => ({ activityId: 22, ...occurrence }))
    )
  })

  test('rolls back every aggregate row when session insertion fails', async () => {
    const harness = createHarness()
    failAt = 'occurrence'
    const result = await createActivityAction({
      ...payload(),
      occurrences: [{ date: '2026-06-10', startTime: '09:00', durationMinutes: 45 }]
    } as never)
    expect(result.success).toBe(false)
    expect(harness.records.get(tables.activityOccurrence)).toBeUndefined()
    expect(harness.records.get(tables.participationActivity)).toBeUndefined()
    expect(transactionCommitted).toBe(false)
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('uses the database-resolved activity type instead of trusting the submitted type id', async () => {
    const harness = createHarness()
    const result = await createActivityAction({
      ...payload(undefined, { typeId: 3 }),
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(true)
    expect(
      harness.pending.get(tables.participationActivity)?.[0]
    ).toMatchObject({
      tipoActividadId: 1
    })
    expect(typeLookups).toHaveLength(1)
  })

  test('creates a music activity with an untimed date and no registration', async () => {
    effectiveTypeSlug = 'musica'
    const harness = createHarness()
    const result = await createActivityAction({
      ...payload(undefined, { bandId: 8 }),
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(true)
    expect(harness.records.get(tables.activityOccurrence)).toEqual([
      { activityId: 22, date: '2026-06-10', startTime: null, durationMinutes: null }
    ])
    expect(harness.pending.has(tables.activityRegistration)).toBe(false)
  })

  test('rejects music activities without a date before inserting aggregate rows', async () => {
    effectiveTypeSlug = 'musica'
    const harness = createHarness()
    const result = await createActivityAction({
      ...payload(undefined, { bandId: 8 }),
      occurrences: []
    } as never)

    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toContain('al menos una fecha')
    expect(typeLookups).toHaveLength(1)
    expect(harness.pending.has(tables.participationActivity)).toBe(false)
    expect(transactionCommitted).toBe(false)
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('rejects registration when the database-resolved effective type is music', async () => {
    effectiveTypeSlug = 'musica'
    const harness = createHarness()
    const result = await createActivityAction(
      payload({
        url: 'https://registro.example/form',
        startDate: '2026-06-10',
        startTime: '10:00',
        endDate: '2026-06-10',
        endTime: '11:00'
      }) as never
    )

    expect(result.success).toBe(false)
    expect(harness.pending.has(tables.participationActivity)).toBe(false)
    expect(transactionCommitted).toBe(false)
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('rolls back activity, detail and registration when the registration insert fails', async () => {
    const harness = createHarness()
    failAt = 'registration'
    const result = await createActivityAction(
      payload({
        url: 'https://registro.example/form',
        startDate: '2026-06-10',
        startTime: '10:00',
        endDate: '2026-06-10',
        endTime: '11:00'
      }) as never
    )

    expect(result.success).toBe(false)
    expect(harness.records.get(tables.participationActivity)).toBeUndefined()
    expect(harness.records.get(tables.activity)).toBeUndefined()
    expect(harness.records.get(tables.activityRegistration)).toBeUndefined()
    expect(transactionCommitted).toBe(false)
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('attaches festival detail and list paths to confirmed activity invalidations', async () => {
    const input = payload()
    input.activity.estado = 'confirmado'
    const result = await createActivityAction({
      ...input,
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(true)
    expect(webInvalidations).toContainEqual({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(webInvalidations).toContainEqual({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })

    const completedInput = payload()
    completedInput.activity.estado = 'completado'
    const completed = await createActivityAction({
      ...completedInput,
      occurrences: [{ date: '2026-06-10' }]
    } as never)
    expect(completed.success).toBe(true)
    expect(webInvalidations).toContainEqual({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('awaits the ordered batch after local invalidation and returns its requested summary', async () => {
    let resolveBatch!: (value: { webRevalidation: 'swr' }) => void
    batchPromise = new Promise((resolve) => {
      resolveBatch = resolve
    })
    const started = new Promise<void>((resolve) => {
      batchStarted = resolve
    })
    const input = payload()
    input.activity.estado = 'completado'
    let settled = false
    const action = createActivityAction({
      ...input,
      occurrences: [{ date: '2026-06-10' }]
    } as never).then((result) => {
      settled = true
      return result
    })

    await started
    expect(settled).toBe(false)
    expect(transactionCommitted).toBe(true)
    expect(updateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'participaciones:edicion:7',
      'actividades:participacion:11',
      'festivales',
      'eventos',
      'ediciones',
      'artistas:detalle'
    ])
    expect(batchCalls).toEqual([
      {
        requests: [
          {
            tag: FESTIVAL_CRITICAL_CACHE_TAG,
            mode: 'immediate'
          },
          {
            tag: FESTIVALES_CACHE_TAG,
            mode: 'swr'
          },
          { tag: 'catalogo:artistas' },
          { tag: 'catalogo:artistas:participaciones' }
        ],
        context: 'create-activity'
      }
    ])
    expect(invalidationCommitStates).toEqual(Array(7).fill(true))

    resolveBatch({ webRevalidation: 'swr' })
    const result = await action
    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
  })

  test('attaches only the festival list path for talks regardless of state', async () => {
    effectiveTypeSlug = 'charla'
    const result = await createActivityAction({
      ...payload(),
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(true)
    expect(batchCalls[0]?.requests).toEqual([
      { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
      {
        tag: FESTIVALES_CACHE_TAG,
        mode: 'swr'
      }
    ])
    expect(result.webRevalidation).toBe('swr')
  })

  test('does not attach festival route paths to private non-talk activities', async () => {
    effectiveTypeSlug = 'musica'
    const result = await createActivityAction({
      ...payload(undefined, { bandId: 8 }),
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(true)

    effectiveTypeSlug = 'taller'
    const privateWorkshop = await createActivityAction({
      ...payload(),
      occurrences: [{ date: '2026-06-10' }]
    } as never)
    expect(privateWorkshop.success).toBe(true)
    expect(batchCalls).toHaveLength(2)
    expect(batchCalls.every(({ requests }) =>
      requests.every(({ path, pathType }) => !path && !pathType)
    )).toBe(true)
    expect(batchCalls.every(({ requests }) =>
      requests.every(({ tag }) =>
        tag !== 'catalogo:artistas' && tag !== 'catalogo:artistas:participaciones'
      )
    )).toBe(true)
  })

  test('invalidates scoped and public tags only after the transaction commits', async () => {
    const result = await createActivityAction({
      ...payload(),
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(true)
    expect(transactionCommitted).toBe(true)
    expect(updateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'participaciones:edicion:7',
      'actividades:participacion:11',
      'festivales',
      'eventos',
      'ediciones',
      'artistas:detalle'
    ])
    expect(batchCalls).toEqual([
      {
        requests: [
          { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
          { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
        ],
        context: 'create-activity'
      }
    ])
    expect(invalidationCommitStates).toEqual(Array(7).fill(true))
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
  })

  test('invalidates the remote catalog after creating a public activity', async () => {
    const input = payload()
    input.activity.estado = 'confirmado'
    const result = await createActivityAction({
      ...input,
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(true)
    expect(transactionCommitted).toBe(true)
    expect(batchCalls).toEqual([
      {
        requests: [
          {
            tag: FESTIVAL_CRITICAL_CACHE_TAG,
            mode: 'immediate'
          },
          {
            tag: FESTIVALES_CACHE_TAG,
            mode: 'swr'
          },
          { tag: 'catalogo:artistas' },
          { tag: 'catalogo:artistas:participaciones' }
        ],
        context: 'create-activity'
      }
    ])
    expect(result.webRevalidation).toBe('swr')
    expect(invalidationCommitStates).toEqual(Array(7).fill(true))
  })

  test('does not invalidate any cache after a later detail mutation fails', async () => {
    createHarness()
    failAt = 'detail'
    const result = await createActivityAction({
      ...payload(),
      occurrences: [{ date: '2026-06-10' }]
    } as never)

    expect(result.success).toBe(false)
    expect(transactionCommitted).toBe(false)
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
