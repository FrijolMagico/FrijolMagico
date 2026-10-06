import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  CATALOG_CACHE_TAG,
  CATALOG_EDITION_DATES_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

let deletedRows: { id: number }[] = [{ id: 1 }]
let failDelete = false
let mutationCompleted = false
let batchSummary: { webRevalidation?: 'swr' | 'immediate' } = {
  webRevalidation: 'swr'
}
let deletedId: number | undefined
let returnedSelection: unknown
const invalidations: string[] = []
const eq = mock((_column: unknown, id: number) => ({ id }))
const returning = mock(async (selection: unknown) => {
  returnedSelection = selection
  if (failDelete) throw new Error('database delete failed')
  mutationCompleted = true
  return deletedRows
})
const updateTag = mock((tag: string) => {
  expect(mutationCompleted).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => {})
const revalidateWebCacheBatch = mock(
  async (requests: unknown[], context: string) => {
    expect(mutationCompleted).toBe(true)
    invalidations.push('batch')
    return batchSummary
  }
)
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const db = {
  delete: () => ({
    where: (condition: { id: number }) => {
      deletedId = condition.id
      return { returning }
    }
  })
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('drizzle-orm', () => ({ eq }))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@frijolmagico/database/schema', () => ({
  events: { event: { id: 'event-id-column' } }
}))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort,
  revalidateWebCacheBatch
}))
const { deleteEventAction } = await import(
  '@/core/eventos/_actions/delete-event.action'
)

beforeEach(() => {
  deletedRows = [{ id: 1 }]
  failDelete = false
  mutationCompleted = false
  batchSummary = { webRevalidation: 'swr' }
  deletedId = undefined
  returnedSelection = undefined
  invalidations.length = 0
  eq.mockClear()
  returning.mockClear()
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  revalidateWebCacheBatch.mockClear()
  requireAuth.mockClear()
})

describe('deleteEventAction catalog freshness', () => {
  test('awaits the exact existing invalidations after deleting an event', async () => {
    const result = await deleteEventAction(1)

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(eq).toHaveBeenCalledWith('event-id-column', 1)
    expect(deletedId).toBe(1)
    expect(returning).toHaveBeenCalledWith({ id: 'event-id-column' })
    expect(returnedSelection).toEqual({ id: 'event-id-column' })
    expect(invalidations).toEqual([`local:${EVENT_CACHE_TAG}`, 'batch'])
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate',
          path: '/festivales/[slug]',
          pathType: 'page'
        },
        {
          tag: FESTIVALES_CACHE_TAG,
          mode: 'swr',
          path: '/festivales',
          pathType: 'page'
        },
        { path: '/', pathType: 'page' },
        { path: '/', pathType: 'layout' },
        { tag: CATALOG_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG },
        { tag: CATALOG_EDITION_DATES_CACHE_TAG }
      ],
      'delete-event'
    )
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('does not invalidate tags or return metadata when the event ID does not exist', async () => {
    deletedRows = []
    const result = await deleteEventAction(1)

    expect(result).toEqual({ success: true })
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('omits freshness metadata when the executed batch has no summary', async () => {
    batchSummary = {}

    const result = await deleteEventAction(1)

    expect(result).toEqual({ success: true })
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(invalidations).toEqual([`local:${EVENT_CACHE_TAG}`, 'batch'])
  })

  test('preserves the exact failure response and does not invalidate on database error', async () => {
    failDelete = true
    const result = await deleteEventAction(1)

    expect(result).toEqual({
      success: false,
      errors: [
        {
          entityType: 'evento',
          message:
            'Error del servidor al intentar eliminar el evento, envíale una captura de pantalla al Nachito pls'
        },
        { entityType: 'evento', message: 'database delete failed' }
      ]
    })
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
