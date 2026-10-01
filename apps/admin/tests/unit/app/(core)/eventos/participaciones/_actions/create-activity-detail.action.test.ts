import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FESTIVAL_CRITICAL_CACHE_TAG } from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const revalidateWebCacheBestEffort = mock(async (_options: unknown) => {})
const getSession = mock(async () => ({ user: { id: '1' } }))
const requireAuth = mock(async () => ({ user: { id: '1' } }))
const getUser = mock(async () => ({ id: '1' }))

type InsertState = {
  valuesArgs: unknown[]
}

function createDbMock() {
  const insertState: InsertState = { valuesArgs: [] }

  return {
    insertState,
    db: {
      insert: () => ({
        values: (...args: unknown[]) => {
          insertState.valuesArgs.push(...args)
          return Promise.resolve()
        }
      })
    }
  }
}

let currentDb = createDbMock().db

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag: mock(() => {}), updateTag }))
mock.module('next/cache.js', () => ({ cacheTag: mock(() => {}), updateTag }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBestEffort }))
mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: new Proxy(
    {},
    {
      get: (_, prop) => currentDb[prop as keyof typeof currentDb]
    }
  )
}))

const { createActivityDetailAction } =
  await import('@/core/eventos/participaciones/_actions/activities/create-activity-detail.action')

describe('createActivityDetailAction', () => {
  beforeEach(() => {
    updateTag.mockClear()
    revalidateWebCacheBestEffort.mockClear()
    requireAuth.mockClear()
    currentDb = createDbMock().db
  })

  test('requires authentication before validating or inserting', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    await createActivityDetailAction(1, {
      participacionActividadId: 10,
      titulo: 'Taller',
      descripcion: null,
      duracionMinutos: null,
      cupos: null,
      horaInicio: '',
      ubicacion: ''
    })

    expect(requireAuth).toHaveBeenCalledTimes(1)
  })

  test('rejects invalid payload and does not insert', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    const result = await createActivityDetailAction(1, {
      participacionActividadId: 'not-a-number',
      titulo: 'Taller',
      descripcion: null,
      duracionMinutos: null,
      cupos: null,
      horaInicio: '',
      ubicacion: ''
    } as unknown as Parameters<typeof createActivityDetailAction>[1])

    expect(result.success).toBe(false)
    expect(dbMock.insertState.valuesArgs).toHaveLength(0)
  })

  test('inserts detail row and invalidates participation activities cache', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    const payload = {
      participacionActividadId: 10,
      titulo: 'Taller de cerámica',
      descripcion: 'Introducción',
      duracionMinutos: 90,
      cupos: 15,
      horaInicio: '10:00',
      ubicacion: 'Sala A'
    }

    const result = await createActivityDetailAction(1, payload)

    expect(result.success).toBe(true)
    expect(dbMock.insertState.valuesArgs).toHaveLength(1)
    expect(dbMock.insertState.valuesArgs[0]).toEqual(payload)
    expect(updateTag).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledTimes(1)
  })

  test('strips unknown fields before inserting', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    const result = await createActivityDetailAction(1, {
      participacionActividadId: 10,
      titulo: 'Taller',
      descripcion: null,
      duracionMinutos: null,
      cupos: null,
      horaInicio: '',
      ubicacion: '',
      extraField: 'should-be-ignored'
    } as unknown as Parameters<typeof createActivityDetailAction>[1])

    expect(result.success).toBe(true)
    expect(dbMock.insertState.valuesArgs[0]).not.toHaveProperty('extraField')
  })

  test('returns failure when the database insert throws', async () => {
    currentDb = {
      insert: () => ({
        values: () => Promise.reject(new Error('connection lost'))
      })
    }

    const result = await createActivityDetailAction(1, {
      participacionActividadId: 10,
      titulo: 'Taller',
      descripcion: null,
      duracionMinutos: null,
      cupos: null,
      horaInicio: '',
      ubicacion: ''
    })

    expect(result.success).toBe(false)
    expect(result.errors?.[0].message).toBe('connection lost')
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
