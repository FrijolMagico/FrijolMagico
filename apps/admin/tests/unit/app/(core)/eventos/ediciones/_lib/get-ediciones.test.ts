import { beforeEach, describe, expect, mock, test, vi } from 'bun:test'

type QueryPlan<T> =
  | { type: 'resolve'; value: T }
  | { type: 'reject'; error: unknown }

const cacheTag = vi.fn()
let currentDb = createDbMock([])

const dbProxy = {
  select: (...args: unknown[]) => currentDb.select(...args)
}

mock.module('next/cache', () => ({ cacheTag }))
mock.module('@frijolmagico/database/orm', () => ({ db: dbProxy }))

function resolved<T>(value: T): QueryPlan<T> {
  return { type: 'resolve', value }
}

function rejected(error: unknown): QueryPlan<never> {
  return { type: 'reject', error }
}

function createQueryBuilder<T>(plan: QueryPlan<T>) {
  const builder = {
    from: () => builder,
    orderBy: () => builder,
    then: (
      resolve: (value: T) => unknown,
      reject?: (reason: unknown) => unknown
    ) => {
      const promise =
        plan.type === 'resolve'
          ? Promise.resolve(plan.value)
          : Promise.reject(plan.error)

      return promise.then(resolve, reject)
    }
  }

  return builder
}

function createDbMock(selectPlans: QueryPlan<unknown>[]) {
  return {
    select: vi.fn(() => {
      const plan = selectPlans.shift()

      if (!plan) {
        throw new Error('No mocked plan available for db.select')
      }

      return createQueryBuilder(plan)
    })
  }
}

const { getEdiciones } = await import(
  '@/core/eventos/ediciones/_lib/get-ediciones-data'
)

describe('getEdiciones partial failure behavior', () => {
  beforeEach(() => {
    cacheTag.mockReset()
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('returns null when both parallel queries fail', async () => {
    currentDb = createDbMock([
      rejected(new Error('ediciones failed')),
      rejected(new Error('dias failed'))
    ])

    const result = await getEdiciones()

    expect(result).toBeNull()
    expect(currentDb.select).toHaveBeenCalledTimes(2)
  })

  test('returns dias when only the ediciones query fails', async () => {
    currentDb = createDbMock([
      rejected(new Error('ediciones failed')),
      resolved([
        {
          id: 22,
          eventoEdicionId: 8,
          lugarId: 5,
          fecha: '2026-01-15',
          modalidad: 'presencial'
        }
      ])
    ])

    const result = await getEdiciones()

    expect(result).toEqual({
      ediciones: [],
      dias: [
        {
          id: '22',
          eventoEdicionId: '8',
          lugarId: '5',
          fecha: '2026-01-15',
          modalidad: 'presencial'
        }
      ]
    })
  })

  test('returns ediciones when only the dias query fails', async () => {
    currentDb = createDbMock([
      resolved([
        {
          id: 7,
          eventoId: 3,
          nombre: 'Edición de otoño'
        }
      ]),
      rejected(new Error('dias failed'))
    ])

    const result = await getEdiciones()

    expect(result).toEqual({
      ediciones: [
        {
          id: '7',
          eventoId: '3',
          nombre: 'Edición de otoño'
        }
      ],
      dias: []
    })
  })
})
