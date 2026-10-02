import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FESTIVALES_CACHE_TAG, FESTIVAL_CRITICAL_CACHE_TAG } from '@frijolmagico/cache-tags'

let committed = false
let activityExists = true
let activityEstado = 'confirmado'
let activityTipoSlug = 'taller'
let failMutation = false
const invalidations: string[] = []
const pathInvalidations: { path: string; pathType?: string }[] = []
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCacheBestEffort = mock(async ({ tag, path, pathType }: { tag: string; mode?: string; path?: string; pathType?: string }) => {
  expect(committed).toBe(true)
  invalidations.push(`web:${tag}`)
  if (path) pathInvalidations.push({ path, pathType })
})
const tx = {
  query: {
    participationExhibition: { findFirst: async () => undefined },
    participationActivity: {
      findFirst: async () => activityExists
        ? { id: 22, participacionId: 11, estado: activityEstado, tipoActividad: { slug: activityTipoSlug }, participacion: { edicionId: 7 } }
        : undefined
    }
  },
  delete: () => ({
    where: async () => {
      if (failMutation) throw new Error('database delete failed')
    }
  })
}
const db = {
  transaction: async (callback: (transaction: typeof tx) => Promise<void>) => {
    await callback(tx)
    committed = true
  }
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth: async () => ({ user: { id: 'admin-1' } }) }))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBestEffort }))
const { deleteActivityAction } = await import(
  '@/core/eventos/participaciones/_actions/activities/delete-activity.action'
)

beforeEach(() => {
  committed = false
  activityExists = true
  activityEstado = 'confirmado'
  activityTipoSlug = 'taller'
  failMutation = false
  invalidations.length = 0
  pathInvalidations.length = 0
  updateTag.mockClear()
  revalidateWebCacheBestEffort.mockClear()
})

describe('deleteActivityAction catalog freshness', () => {
  test('invalidates the web catalog only after deleting an existing activity', async () => {
    const result = await deleteActivityAction({ id: 22 })

    expect(result.success).toBe(true)
    expect(invalidations).toContain('web:catalogo:artistas')
    expect(invalidations).toContain('web:catalogo:artistas:participaciones')
    expect(invalidations).toContain('local:participaciones:edicion:7')
    expect(invalidations).toContain('local:actividades:participacion:11')
    expect(invalidations).toContain('local:artistas:detalle')
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: 'catalogo:artistas' })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: 'catalogo:artistas:participaciones' })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page' })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: FESTIVALES_CACHE_TAG, mode: 'swr', path: '/festivales', pathType: 'page' })
    expect(pathInvalidations).toEqual([
      { path: '/festivales/[slug]', pathType: 'page' },
      { path: '/festivales', pathType: 'page' }
    ])
  })

  test('preserves other tag invalidations but skips remote catalog for unpublished activity', async () => {
    activityEstado = 'seleccionado'
    const result = await deleteActivityAction({ id: 22 })

    expect(result.success).toBe(true)
    expect(invalidations).toContain('local:festivales')
    expect(invalidations).toContain(`web:${FESTIVAL_CRITICAL_CACHE_TAG}`)
    expect(invalidations).toContain(`web:${FESTIVALES_CACHE_TAG}`)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: FESTIVALES_CACHE_TAG, mode: 'swr' })
    expect(invalidations).not.toContain('web:catalogo:artistas')
    expect(invalidations).not.toContain('web:catalogo:artistas:participaciones')
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledTimes(2)
    expect(pathInvalidations).toEqual([])
  })

  test('invalidates the festival list for an unpublished talk without invalidating its detail page', async () => {
    activityEstado = 'seleccionado'
    activityTipoSlug = 'charla'
    const result = await deleteActivityAction({ id: 22 })

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: FESTIVALES_CACHE_TAG, mode: 'swr', path: '/festivales', pathType: 'page' })
    expect(pathInvalidations).toEqual([{ path: '/festivales', pathType: 'page' }])
  })

  test('does not purge caches when the activity is already absent', async () => {
    activityExists = false
    const result = await deleteActivityAction({ id: 22 })

    expect(result.success).toBe(true)
    expect(result.data?.alreadyAbsent).toBe(true)
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(pathInvalidations).toEqual([])
  })

  test('does not invalidate caches when the database deletion fails', async () => {
    failMutation = true
    const result = await deleteActivityAction({ id: 22 })

    expect(result.success).toBe(false)
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(pathInvalidations).toEqual([])
  })
})
