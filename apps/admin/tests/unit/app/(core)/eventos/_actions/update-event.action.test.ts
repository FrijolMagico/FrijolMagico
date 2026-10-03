import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG
} from '@frijolmagico/cache-tags'

let eventName = 'Evento original'
let failUpdate = false
let returningRows = [{ id: 1 }]
let projectionSequence: (Record<string, unknown> | null)[] = []
let transactionCompleted = false
const activeDisplay = {
  id: 10,
  slug: 'festival-i',
  event_name: 'Evento original',
  edition_number: 'I',
  start_date: '2026-10-01',
  end_date: '2026-10-01',
  days: [{ fecha: '2026-10-01', lugar: null }]
}
const updateTag = mock(() => {})
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => {})

const select = () => ({
  from: () => ({
    where: () => ({
      limit: async () => [{ nombre: eventName }]
    })
  })
})
const update = () => ({
  set: (values: { nombre?: string }) => ({
    where: () => ({
      returning: async () => {
        if (failUpdate) throw new Error('database update failed')
        if (returningRows.length > 0 && values.nombre !== undefined) {
          eventName = values.nombre
        }
        return returningRows
      }
    })
  })
})
const db = {
  transaction: async (
    callback: (tx: { select: typeof select; update: typeof update }) => Promise<unknown>
  ) => {
    const result = await callback({ select, update })
    transactionCompleted = true
    return result
  },
  select,
  update
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({
  requireAuth: async () => ({ user: { id: 'admin-1' } })
}))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort
}))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@frijolmagico/database/active-festival-display', () => ({
  getActiveFestivalDisplay: async () => {
    const projection = projectionSequence.shift()
    return projection ?? null
  },
  compareActiveFestivalDisplay: (before: unknown, after: unknown) =>
    JSON.stringify(before) !== JSON.stringify(after)
}))

const { updateEventAction } = await import(
  '@/core/eventos/_actions/update-event.action'
)

beforeEach(() => {
  eventName = 'Evento original'
  failUpdate = false
  returningRows = [{ id: 1 }]
  projectionSequence = []
  transactionCompleted = false
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
})

describe('updateEventAction catalog freshness', () => {
  test('invalidates the dedicated display tag only when the selected event name changes', async () => {
    projectionSequence = [activeDisplay, { ...activeDisplay, event_name: 'Evento nuevo' }]
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento nuevo' }
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledTimes(2)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
    expect(transactionCompleted).toBe(true)
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
    expect(updateTag).toHaveBeenCalledWith('eventos')
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
  })

  test('does not invalidate active display for an unchanged selected projection', async () => {
    projectionSequence = [activeDisplay, activeDisplay]
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento original' }
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: 'catalogo:artistas'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('preserves festival and local invalidations when no row was updated', async () => {
    returningRows = []
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento nuevo' }
    )

    expect(result.success).toBe(true)
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
    expect(revalidateWebCache).toHaveBeenCalledTimes(2)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: 'catalogo:artistas'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('does not invalidate active display when the transaction mutation fails', async () => {
    projectionSequence = [activeDisplay]
    failUpdate = true
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento nuevo' }
    )

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
    expect(updateTag).not.toHaveBeenCalled()
  })
})
