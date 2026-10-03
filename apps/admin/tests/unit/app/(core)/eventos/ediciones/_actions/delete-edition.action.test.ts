import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG
} from '@frijolmagico/cache-tags'

let deletedRows: { id: number; published: boolean; slug: string }[] = [
  { id: 1, published: true, slug: 'festival-2025' }
]
let returnedProjection: Record<string, unknown> | undefined
let failDelete = false
let mutationCompleted = false
let transactionCommitted = false
let projectionSequence: (Record<string, unknown> | null)[] = []
const activeDisplay = {
  id: 1,
  slug: 'festival-2025',
  event_name: 'Festival',
  edition_number: 'I',
  start_date: '2026-10-01',
  end_date: '2026-10-01',
  days: [{ fecha: '2026-10-01', lugar: 'Plaza' }]
}
const invalidations: string[] = []
const updateTag = mock((tag: string) => {
  expect(mutationCompleted).toBe(true)
  expect(transactionCommitted).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCache = mock(
  async (options: {
    tag?: string
    mode?: 'immediate' | 'swr'
    path?: string
    pathType?: 'page' | 'layout'
  }) => {
    expect(mutationCompleted).toBe(true)
    expect(transactionCommitted).toBe(true)
    invalidations.push(`web:${options.tag ?? options.path}`)
    return { revalidated: true }
  }
)
const deleteRows = () => ({
  where: () => ({
    returning: async (projection: Record<string, unknown>) => {
      if (failDelete) throw new Error('database delete failed')
      returnedProjection = projection
      mutationCompleted = true
      return deletedRows
    }
  })
})
const db = {
  transaction: async (callback: (tx: { delete: typeof deleteRows }) => Promise<unknown>) => {
    const result = await callback({ delete: deleteRows })
    transactionCommitted = true
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
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCache }))
const { deleteEditionAction } = await import(
  '@/core/eventos/ediciones/_actions/delete-edition.action'
)

beforeEach(() => {
  deletedRows = [{ id: 1, published: true, slug: 'festival-2025' }]
  returnedProjection = undefined
  failDelete = false
  mutationCompleted = false
  transactionCommitted = false
  projectionSequence = []
  invalidations.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
})

describe('deleteEditionAction catalog freshness', () => {
  test('invalidates active display when deleting the selected edition and skips root paths', async () => {
    projectionSequence = [activeDisplay, null]
    const result = await deleteEditionAction({ success: true }, { id: 1 })

    expect(result.success).toBe(true)
    expect(Object.keys(returnedProjection ?? {}).sort()).toEqual(['id', 'slug'])
    expect(invalidations).toContain('local:ediciones')
    expect(invalidations).toContain('local:ediciones:dias')
    expect(invalidations).toContain('web:catalogo:artistas')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      path: '/festivales/festival-2025'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      path: '/festivales'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas' })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
    expect(revalidateWebCache).toHaveBeenCalledTimes(8)
  })

  test('does not invalidate root paths when deleting an unpublished edition', async () => {
    deletedRows = [{ id: 1, published: false, slug: 'festival-2025' }]

    await deleteEditionAction({ success: true }, { id: 1 })

    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      path: '/festivales/festival-2025'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      path: '/festivales'
    })
  })

  test('does not invalidate root paths when the deleted edition has an empty slug', async () => {
    deletedRows = [{ id: 1, published: true, slug: '' }]

    await deleteEditionAction({ success: true }, { id: 1 })

    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
  })

  test('does not invalidate active display when the edition ID does not exist', async () => {
    projectionSequence = [activeDisplay, activeDisplay]
    deletedRows = []
    const result = await deleteEditionAction({ success: true }, { id: 1 })

    expect(result.success).toBe(true)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('does not invalidate active display when the deletion transaction fails', async () => {
    projectionSequence = [activeDisplay]
    failDelete = true

    await expect(
      deleteEditionAction({ success: true }, { id: 1 })
    ).rejects.toThrow('database delete failed')
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
  })
})
