import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

let deletedRows: { id: number; published: boolean; slug: string }[] = [
  { id: 1, published: true, slug: 'festival-2025' }
]
let returnedProjection: Record<string, unknown> | undefined
let failDelete = false
let mutationCompleted = false
const invalidations: string[] = []
const updateTag = mock((tag: string) => {
  expect(mutationCompleted).toBe(true)
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
    invalidations.push(`web:${options.tag ?? options.path}`)
    return { revalidated: true }
  }
)
const db = {
  delete: () => ({
    where: () => ({
      returning: async (projection: Record<string, unknown>) => {
        if (failDelete) throw new Error('database delete failed')
        returnedProjection = projection
        mutationCompleted = true
        return deletedRows
      }
    })
  })
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db }))
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
  invalidations.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
})

describe('deleteEditionAction catalog freshness', () => {
  test('invalidates edition and web catalog tags after deleting an edition', async () => {
    const result = await deleteEditionAction({ success: true }, { id: 1 })

    expect(result.success).toBe(true)
    expect(Object.keys(returnedProjection ?? {}).sort()).toEqual([
      'id',
      'published',
      'slug'
    ])
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
    expect(revalidateWebCache).toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas' })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
    expect(revalidateWebCache).toHaveBeenCalledTimes(9)
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

  test('does not invalidate tags when the edition ID does not exist', async () => {
    deletedRows = []
    const result = await deleteEditionAction({ success: true }, { id: 1 })

    expect(result.success).toBe(true)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
  })

  test('preserves database errors and does not invalidate tags when deletion fails', async () => {
    failDelete = true

    await expect(
      deleteEditionAction({ success: true }, { id: 1 })
    ).rejects.toThrow('database delete failed')
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
  })
})
