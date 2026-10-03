import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const revalidateWebCache = mock(async () => ({ revalidated: true }))
const revalidateWebCacheBestEffort = mock(async () => ({ revalidated: true }))
const values = mock(async () => {})
const event = {}
const db = {
  insert: () => ({ values })
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({
  requireAuth: async () => ({ user: { id: 'admin-1' } })
}))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort
}))
mock.module('@frijolmagico/database/schema', () => ({ events: { event } }))
mock.module('@/core/eventos/_schemas/event.schema', () => ({
  eventInsertSchema: {
    safeParse: (data: unknown) => ({ success: true, data })
  }
}))

const { createEventAction } = await import(
  '@/core/eventos/_actions/create-event.action'
)

beforeEach(() => {
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  values.mockClear()
})

describe('createEventAction public cache freshness', () => {
  test('invalidates festival-critical and discovery tags after creating an event', async () => {
    const result = await createEventAction(
      { success: true },
      { nombre: 'Festival nuevo', slug: 'festival-nuevo', organizacionId: null }
    )

    expect(result.success).toBe(true)
    expect(values).toHaveBeenCalledTimes(1)
    expect(updateTag).toHaveBeenCalledWith(EVENT_CACHE_TAG)
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
    expect(revalidateWebCache).toHaveBeenCalledTimes(2)
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
