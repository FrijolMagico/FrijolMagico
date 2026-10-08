import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FESTIVALES_CACHE_TAG, FESTIVAL_CRITICAL_CACHE_TAG } from '@frijolmagico/cache-tags'

let committed = false
let activityExists = true
let activityEstado = 'confirmado'
let activityTipoSlug = 'taller'
let failMutation = false
const invalidations: string[] = []
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCacheBatch = mock(
  async (_requests: unknown, _context: string) => ({
    webRevalidation: 'swr' as const
  })
)
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
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBatch,
  revalidateWebCacheBestEffort: mock(async () => {})
}))
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
  updateTag.mockClear()
  revalidateWebCacheBatch.mockReset()
  revalidateWebCacheBatch.mockResolvedValue({ webRevalidation: 'swr' })
})

describe('deleteActivityAction catalog freshness', () => {
  test('awaits the ordered requested invalidations for a public activity', async () => {
    const result = await deleteActivityAction({ id: 22 })

    expect(result).toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false },
      webRevalidation: 'swr'
    })
    expect(invalidations).toEqual([
      'local:participaciones:edicion:7',
      'local:actividades:participacion:11',
      'local:artistas:detalle',
      'local:festivales',
      'local:eventos',
      'local:ediciones'
    ])
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
        { tag: 'catalogo:artistas' },
        { tag: 'catalogo:artistas:participaciones' }
      ],
      'delete-activity'
    )
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
  })

  test('preserves the tag and mode requests for a completed activity', async () => {
    activityEstado = 'completado'
    await deleteActivityAction({ id: 22 })

    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
        { tag: 'catalogo:artistas' },
        { tag: 'catalogo:artistas:participaciones' }
      ],
      'delete-activity'
    )
  })

  test('preserves the unpublished request modes and omits gated paths and catalog requests', async () => {
    activityEstado = 'seleccionado'
    const result = await deleteActivityAction({ id: 22 })

    expect(result).toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false },
      webRevalidation: 'swr'
    })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'delete-activity'
    )
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
  })

  test('preserves the festival-list tag and mode for an unpublished talk', async () => {
    activityEstado = 'seleccionado'
    activityTipoSlug = 'charla'
    const result = await deleteActivityAction({ id: 22 })

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'delete-activity'
    )
  })

  test('does not purge caches or attach metadata when the activity is already absent', async () => {
    activityExists = false
    const result = await deleteActivityAction({ id: 22 })

    expect(result).toEqual({
      success: true,
      data: { alreadyAbsent: true, participationDeleted: false }
    })
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('does not invalidate caches or attach metadata when the database deletion fails', async () => {
    failMutation = true
    const result = await deleteActivityAction({ id: 22 })

    expect(result).toEqual({
      success: false,
      errors: [{ entityType: 'participacion', message: 'database delete failed' }]
    })
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('keeps the action pending until the batch resolves and returns its requested summary', async () => {
    let resolveBatch: (summary: { webRevalidation: 'swr' }) => void = () => {}
    let startBatch: () => void = () => {}
    const batchStarted = new Promise<void>((resolve) => (startBatch = resolve))
    revalidateWebCacheBatch.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveBatch = resolve
        startBatch()
      })
    )

    let actionSettled = false
    const actionPromise = deleteActivityAction({ id: 22 }).then((result) => {
      actionSettled = true
      return result
    })

    await Promise.race([batchStarted, actionPromise.then(() => undefined)])
    expect(actionSettled).toBe(false)
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)

    resolveBatch({ webRevalidation: 'swr' })
    expect(await actionPromise).toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false },
      webRevalidation: 'swr'
    })
  })
})
