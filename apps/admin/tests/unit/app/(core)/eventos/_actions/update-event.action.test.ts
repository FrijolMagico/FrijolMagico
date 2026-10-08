import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { EventUpdateInput } from '@/core/eventos/_schemas/event.schema'
import {
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

let eventName = 'Evento original'
let failUpdate = false
let failAuth = false
let returningRows = [{ id: 1 }]
let updateValues: { id?: number; nombre?: string } | undefined
let batchResult: { webRevalidation?: 'swr' | 'immediate' } = {
  webRevalidation: 'swr'
}
let batchDeferred: Promise<{ webRevalidation?: 'swr' | 'immediate' }> | undefined
const updateTag = mock(() => {})
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => {})
const revalidateWebCacheBatch = mock(async () => batchDeferred ?? batchResult)

const db = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: async () => [{ nombre: eventName }]
      })
    })
  }),
  update: () => ({
    set: (values: { id?: number; nombre?: string }) => ({
      where: () => ({
        returning: async () => {
          updateValues = values
          if (failUpdate) throw new Error('database update failed')
          if (returningRows.length > 0 && values.nombre !== undefined) {
            eventName = values.nombre
          }
          return returningRows
        }
      })
    })
  })
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({
  requireAuth: async () => {
    if (failAuth) throw new Error('authentication required')
    return { user: { id: 'admin-1' } }
  }
}))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort,
  revalidateWebCacheBatch
}))
mock.module('@frijolmagico/database/orm', () => ({ db }))

const { updateEventAction } = await import(
  '@/core/eventos/_actions/update-event.action'
)

beforeEach(() => {
  eventName = 'Evento original'
  failUpdate = false
  failAuth = false
  returningRows = [{ id: 1 }]
  updateValues = undefined
  batchResult = { webRevalidation: 'swr' }
  batchDeferred = undefined
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  revalidateWebCacheBatch.mockClear()
})

describe('updateEventAction cache freshness', () => {
  test('batches name-change, festival, and homepage requests after updating the event', async () => {
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento nuevo' }
    )

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(updateValues).toEqual({ id: 1, nombre: 'Evento nuevo' })
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: 'catalogo:artistas' },
        { tag: 'catalogo:artistas:participaciones' },
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'update-event'
    )
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('keeps festival and local event invalidations for an unchanged name', async () => {
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento original' }
    )

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'update-event'
    )
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
  })

  test('still requests festival SWR when no row was updated', async () => {
    returningRows = []
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento nuevo' }
    )

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'update-event'
    )
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
  })

  test('waits for the batch before returning its freshness metadata', async () => {
    let resolveBatch!: (result: { webRevalidation: 'swr' }) => void
    batchDeferred = new Promise((resolve) => {
      resolveBatch = resolve
    })
    let actionSettled = false
    const pendingResult = updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento original' }
    ).then((result) => {
      actionSettled = true
      return result
    })

    for (let attempt = 0; attempt < 10; attempt++) {
      if (revalidateWebCacheBatch.mock.calls.length > 0) break
      await Promise.resolve()
    }
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(actionSettled).toBe(false)
    resolveBatch({ webRevalidation: 'swr' })
    expect(await pendingResult).toEqual({
      success: true,
      webRevalidation: 'swr'
    })
  })

  test('omits freshness metadata when the batch reports no requested policy', async () => {
    batchResult = {}
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento original' }
    )

    expect(result).toEqual({ success: true })
  })

  test('does not invalidate caches when the event ID is invalid', async () => {
    const result = await updateEventAction(
      { success: true },
      { id: 0, nombre: 'Evento nuevo' }
    )

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('does not invalidate caches when the update payload fails schema validation', async () => {
    const malformedPayload = {
      id: 1,
      nombre: 42
    } as unknown as EventUpdateInput
    const result = await updateEventAction({ success: true }, malformedPayload)

    expect(result.success).toBe(false)
    expect(updateValues).toBeUndefined()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('does not invalidate caches when authentication fails', async () => {
    failAuth = true
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento nuevo' }
    )

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('does not invalidate caches when the database update fails', async () => {
    failUpdate = true
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento nuevo' }
    )

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})
