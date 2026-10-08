import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

type InvalidationRequest = {
  tag?: string
  mode?: 'immediate' | 'swr'
  path?: string
  pathType?: 'page' | 'layout'
}

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
const revalidateWebCacheBatch = mock(
  async (requests: InvalidationRequest[], context: string) => {
    expect(mutationCompleted).toBe(true)
    invalidations.push(`batch:${context}:${requests.length}`)
    for (const request of requests) {
      invalidations.push(`web:${request.tag ?? request.path}`)
    }
    return { webRevalidation: 'swr' as const }
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
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBatch }))
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
  revalidateWebCacheBatch.mockClear()
})

describe('deleteEditionAction catalog freshness', () => {
  test('batches the existing requests in order and returns requested freshness', async () => {
    const result = await deleteEditionAction({ success: true }, { id: 1 })

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(Object.keys(returnedProjection ?? {})).toEqual(['id'])
    expect(invalidations).toContain('local:ediciones')
    expect(invalidations).toContain('local:ediciones:dias')
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
        { tag: 'catalogo:artistas' },
        { tag: 'catalogo:artistas:participaciones' },
        { tag: 'catalogo:artistas:fechas-edicion' }
      ],
      'delete-edition'
    )
  })

  test('keeps each deleted row request group before catalog-wide requests', async () => {
    deletedRows = [
      { id: 1, published: true, slug: 'first-festival' },
      { id: 2, published: false, slug: 'second-festival' }
    ]

    await deleteEditionAction({ success: true }, { id: 1 })

    expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).toEqual([
      { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
      { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
      { tag: 'catalogo:artistas' },
      { tag: 'catalogo:artistas:participaciones' },
      { tag: 'catalogo:artistas:fechas-edicion' }
    ])
  })

  test('keeps tag-only invalidation for unpublished editions', async () => {
    deletedRows = [{ id: 1, published: false, slug: 'festival-2025' }]

    await deleteEditionAction({ success: true }, { id: 1 })

    expect(revalidateWebCacheBatch.mock.calls[0]?.[0].slice(0, 2)).toEqual([
      { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
      { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
    ])
  })

  test('keeps tag-only invalidation when a published edition has no slug', async () => {
    deletedRows = [{ id: 1, published: true, slug: '' }]

    await deleteEditionAction({ success: true }, { id: 1 })

    expect(revalidateWebCacheBatch.mock.calls[0]?.[0].slice(0, 2)).toEqual([
      { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
      { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
    ])
  })

  test('does not invalidate or report freshness when the edition ID does not exist', async () => {
    deletedRows = []
    const result = await deleteEditionAction({ success: true }, { id: 1 })

    expect(result).toEqual({ success: true })
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('preserves database errors and does not invalidate when deletion fails', async () => {
    failDelete = true

    await expect(
      deleteEditionAction({ success: true }, { id: 1 })
    ).rejects.toThrow('database delete failed')
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
