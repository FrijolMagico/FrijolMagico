import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG
} from '@frijolmagico/cache-tags'

let deletedRows: { id: number }[] = [{ id: 1 }]
let failDelete = false
let mutationCompleted = false
let projectionSequence: (Record<string, unknown> | null)[] = []
let transactionCompleted = false
const activeDisplay = {
  id: 10,
  slug: 'festival-i',
  event_name: 'Festival',
  edition_number: 'I',
  start_date: '2026-10-01',
  end_date: '2026-10-01',
  days: [{ fecha: '2026-10-01', lugar: null }]
}
const updateTag = mock((tag: string) => {
  expect(mutationCompleted).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCache = mock(async ({ tag }: { tag: string }) => {
  expect(mutationCompleted).toBe(true)
  invalidations.push(`web:${tag}`)
  return { revalidated: true }
})
const revalidateWebCacheBestEffort = mock(async () => ({ revalidated: true }))
const invalidations: string[] = []
const deleteRows = () => ({
  where: () => ({
    returning: async () => {
      if (failDelete) throw new Error('database delete failed')
      mutationCompleted = true
      return deletedRows
    }
  })
})
const db = {
  transaction: async (callback: (tx: { delete: typeof deleteRows }) => Promise<unknown>) => {
    const result = await callback({ delete: deleteRows })
    transactionCompleted = true
    return result
  },
  delete: deleteRows
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@frijolmagico/database/active-festival-display', () => ({
  getActiveFestivalDisplay: async () => projectionSequence.shift() ?? null,
  compareActiveFestivalDisplay: (before: unknown, after: unknown) =>
    JSON.stringify(before) !== JSON.stringify(after)
}))
mock.module('@/shared/lib/auth/utils', () => ({
  requireAuth: async () => ({ user: { id: 'admin-1' } })
}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort
}))
const { deleteEventAction } = await import(
  '@/core/eventos/_actions/delete-event.action'
)

beforeEach(() => {
  deletedRows = [{ id: 1 }]
  failDelete = false
  mutationCompleted = false
  projectionSequence = []
  transactionCompleted = false
  invalidations.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
})

describe('deleteEventAction catalog freshness', () => {
  test('invalidates active display when deleting its selected event', async () => {
    projectionSequence = [activeDisplay, null]
    const result = await deleteEventAction(1)

    expect(result.success).toBe(true)
    expect(invalidations).toContain('local:eventos')
    expect(invalidations).toContain('web:catalogo:artistas')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr',
      path: '/festivales',
      pathType: 'page'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
    expect(transactionCompleted).toBe(true)
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas' })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
    expect(revalidateWebCache).toHaveBeenCalledTimes(6)
  })

  test('does not invalidate active display when the event ID does not exist', async () => {
    projectionSequence = [activeDisplay, activeDisplay]
    deletedRows = []
    const result = await deleteEventAction(1)

    expect(result.success).toBe(true)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('does not invalidate active display after a failed transaction', async () => {
    projectionSequence = [activeDisplay]
    failDelete = true
    const result = await deleteEventAction(1)

    expect(result.success).toBe(false)
    expect(result.errors).toHaveLength(2)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
  })
})
