import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const cacheEffectOrder: string[] = []
const updateTag = mock(() => {
  cacheEffectOrder.push('updateTag')
})
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => ({ revalidated: true }))
let batchResult: Promise<{ webRevalidation?: 'swr' | 'immediate' }> = Promise.resolve({})
const revalidateWebCacheBatch = mock(async (...args: unknown[]) => {
  void args
  cacheEffectOrder.push('batch')
  return batchResult
})
const expectedRequests = [
  { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
  { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
]
let authError: Error | undefined
const requireAuth = mock(async () => {
  if (authError) throw authError
  return { user: { id: 'admin-1' } }
})
let schemaValid = true
let insertError: Error | undefined
const values = mock(async () => {
  if (insertError) throw insertError
})
const event = {}
const db = {
  insert: () => ({ values })
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort,
  revalidateWebCacheBatch
}))
mock.module('@frijolmagico/database/schema', () => ({ events: { event } }))
mock.module('@/core/eventos/_schemas/event.schema', () => ({
  eventInsertSchema: {
    safeParse: (data: unknown) =>
      schemaValid
        ? { success: true, data }
        : { success: false, error: { issues: [{ message: 'Datos inválidos' }] } }
  }
}))

const { createEventAction } = await import(
  '@/core/eventos/_actions/create-event.action'
)

beforeEach(() => {
  cacheEffectOrder.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  revalidateWebCacheBatch.mockClear()
  requireAuth.mockClear()
  values.mockClear()
  authError = undefined
  schemaValid = true
  insertError = undefined
  batchResult = Promise.resolve({})
})

describe('createEventAction public cache freshness', () => {
  test('awaits mixed immediate/SWR requests and returns the requested SWR summary', async () => {
    let resolveBatch: (result: { webRevalidation?: 'swr' | 'immediate' }) => void =
      () => {}
    batchResult = new Promise((resolve) => {
      resolveBatch = resolve
    })

    let actionSettled = false
    const action = createEventAction(
      { success: true },
      { nombre: 'Festival nuevo', slug: 'festival-nuevo', organizacionId: null }
    ).then((result) => {
      actionSettled = true
      return result
    })

    await Promise.resolve()
    await Promise.resolve()
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      expectedRequests,
      'create-event'
    )
    expect(cacheEffectOrder).toEqual(['updateTag', 'batch'])
    expect(actionSettled).toBe(false)

    resolveBatch({ webRevalidation: 'swr' })
    await expect(action).resolves.toEqual({
      success: true,
      webRevalidation: 'swr'
    })
    expect(values).toHaveBeenCalledTimes(1)
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('preserves authorization, schema, and database failure gates without cache effects', async () => {
    authError = new Error('No autorizado')
    const unauthorized = await createEventAction({ success: true }, {
      nombre: 'Evento',
      slug: 'evento',
      organizacionId: null
    })
    expect(unauthorized).toEqual({
      success: false,
      errors: [{ entityType: 'eventos', message: 'No autorizado' }]
    })
    expect(values).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()

    authError = undefined
    schemaValid = false
    const invalid = await createEventAction({ success: true }, {
      nombre: 'Evento',
      slug: 'evento',
      organizacionId: null
    })
    expect(invalid).toEqual({
      success: false,
      errors: [{ entityType: 'evento', message: 'Datos inválidos' }]
    })
    expect(values).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()

    schemaValid = true
    insertError = new Error('DB falló')
    const failedInsert = await createEventAction({ success: true }, {
      nombre: 'Evento',
      slug: 'evento',
      organizacionId: null
    })
    expect(failedInsert).toEqual({
      success: false,
      errors: [{ entityType: 'eventos', message: 'DB falló' }]
    })
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('preserves the success DTO when an executed mixed batch has no freshness summary', async () => {
    batchResult = Promise.resolve({})
    const result = await createEventAction({ success: true }, {
      nombre: 'Evento',
      slug: 'evento',
      organizacionId: null
    })

    expect(result).toEqual({ success: true })
    expect(result).not.toHaveProperty('webRevalidation')
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      expectedRequests,
      'create-event'
    )
    expect(cacheEffectOrder).toEqual(['updateTag', 'batch'])
    expect(values).toHaveBeenCalledTimes(1)
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
