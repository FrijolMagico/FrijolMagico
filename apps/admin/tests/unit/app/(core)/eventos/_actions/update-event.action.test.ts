import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

let eventName = 'Evento original'
let failUpdate = false
let returningRows = [{ id: 1 }]
const updateTag = mock(() => {})
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => {})

const db = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: async () => [{ nombre: eventName }]
      })
    })
  }),
  update: () => ({
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

const { updateEventAction } = await import(
  '@/core/eventos/_actions/update-event.action'
)

beforeEach(() => {
  eventName = 'Evento original'
  failUpdate = false
  returningRows = [{ id: 1 }]
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
})

describe('updateEventAction catalog freshness', () => {
  test('invalidates the web catalog after changing the event name', async () => {
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
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      path: '/',
      pathType: 'page'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      path: '/',
      pathType: 'layout'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledTimes(4)
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

  test('does not invalidate the web catalog for a no-op name update', async () => {
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
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      path: '/',
      pathType: 'page'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      path: '/',
      pathType: 'layout'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledTimes(2)
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
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      path: '/',
      pathType: 'page'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      path: '/',
      pathType: 'layout'
    })
  })

  test('does not invalidate the web catalog when the update fails', async () => {
    failUpdate = true
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento nuevo' }
    )

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})
