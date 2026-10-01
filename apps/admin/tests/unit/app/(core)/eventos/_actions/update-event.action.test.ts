import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

let eventName = 'Evento original'
let failUpdate = false
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
          if (values.nombre !== undefined) eventName = values.nombre
          return [{ id: 1 }]
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
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledTimes(2)
    expect(updateTag).toHaveBeenCalledWith('eventos')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
  })

  test('does not invalidate the web catalog for a no-op name update', async () => {
    const result = await updateEventAction(
      { success: true },
      { id: 1, nombre: 'Evento original' }
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
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
