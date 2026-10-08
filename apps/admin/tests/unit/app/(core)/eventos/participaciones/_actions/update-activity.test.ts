import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FESTIVALES_CACHE_TAG, FESTIVAL_CRITICAL_CACHE_TAG } from '@frijolmagico/cache-tags'

let committed = false
let failMutation = false
let existingActivity = {
  participacionId: 11,
  tipoActividadId: 2,
  modoIngresoId: 1,
  estado: 'confirmado',
  puntaje: null,
  notas: 'anterior',
  participacion: { edicionId: 7 },
  tipoActividad: { slug: 'taller' }
}
let newActivityType = { slug: 'charla' }
const invalidations: string[] = []
const batchCalls: { requests: unknown[]; context?: string }[] = []
let batchSummary: { webRevalidation?: 'swr' | 'immediate' } = { webRevalidation: 'swr' }
let batchBarrier: Promise<void> | undefined
let batchStarted: (() => void) | undefined
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCacheBestEffort = mock(async () => {})
const revalidateWebCacheBatch = mock(async (requests: unknown[], context?: string) => {
  expect(committed).toBe(true)
  invalidations.push('web:batch')
  batchCalls.push({ requests, context })
  batchStarted?.()
  await batchBarrier
  return batchSummary
})
const tx = {
  query: {
    participationActivity: {
      findFirst: async () => existingActivity
    },
    activityType: {
      findFirst: async () => newActivityType
    }
  },
  update: () => ({
    set: () => ({
      where: async () => {
        if (failMutation) throw new Error('database update failed')
      }
    })
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
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBestEffort, revalidateWebCacheBatch }))

const { updateActivityAction } = await import(
  '@/core/eventos/participaciones/_actions/activities/update-activity.action'
)

const payload = {
  id: 22,
  participacionId: 11,
  tipoActividadId: 1,
  modoIngresoId: 2,
  estado: 'seleccionado' as const,
  puntaje: null,
  notas: ''
}

beforeEach(() => {
  committed = false
  failMutation = false
  existingActivity = {
    participacionId: 11,
    tipoActividadId: 2,
    modoIngresoId: 1,
    estado: 'confirmado',
    puntaje: null,
    notas: 'anterior',
    participacion: { edicionId: 7 },
    tipoActividad: { slug: 'taller' }
  }
  newActivityType = { slug: 'charla' }
  invalidations.length = 0
  batchCalls.length = 0
  batchSummary = { webRevalidation: 'swr' }
  batchBarrier = undefined
  batchStarted = undefined
  updateTag.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  revalidateWebCacheBatch.mockClear()
})

describe('updateActivityAction catalog freshness', () => {
  test('invalidates the web catalog only after a successful database mutation', async () => {
    const result = await updateActivityAction(payload)

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(invalidations).toContain('web:batch')
    expect(invalidations).toContain('local:actividades:participacion:11')
    expect(invalidations).toContain('local:participaciones:edicion:7')
    expect(invalidations).toContain('local:artistas:detalle')
    expect(invalidations).toContain('local:festivales')
    expect(batchCalls).toEqual([
      {
        requests: [
          {
            tag: FESTIVAL_CRITICAL_CACHE_TAG,
            mode: 'immediate'
          },
          {
            tag: FESTIVALES_CACHE_TAG,
            mode: 'swr'
          },
          { tag: 'catalogo:artistas' },
          { tag: 'catalogo:artistas:participaciones' }
        ],
        context: 'update-activity'
      }
    ])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(invalidations.indexOf('web:batch')).toBeGreaterThan(
      invalidations.lastIndexOf('local:festivales')
    )
  })

  test('does not invalidate caches for a no-op update', async () => {
    existingActivity = {
      participacionId: 11,
      tipoActividadId: 1,
      modoIngresoId: 2,
      estado: 'seleccionado',
      puntaje: null,
      notas: '',
      participacion: { edicionId: 7 },
      tipoActividad: { slug: 'taller' }
    }
    const result = await updateActivityAction(payload)

    expect(result.success).toBe(true)
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(invalidations).not.toContain('web:catalogo:artistas:participaciones')
  })

  test('does not attach festival pages for changes outside their public projections', async () => {
    const result = await updateActivityAction({ ...payload, tipoActividadId: 2, estado: 'confirmado', modoIngresoId: 3 })

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
      ],
      'update-activity'
    )
  })

  test('does not attach the festival list page when a charla remains counted across a status change', async () => {
    existingActivity = {
      participacionId: 11,
      tipoActividadId: 1,
      modoIngresoId: 1,
      estado: 'seleccionado',
      puntaje: null,
      notas: 'anterior',
      participacion: { edicionId: 7 },
      tipoActividad: { slug: 'charla' }
    }
    newActivityType = { slug: 'charla' }

    const result = await updateActivityAction({ ...payload, tipoActividadId: 1, estado: 'confirmado' })

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
        { tag: 'catalogo:artistas' },
        { tag: 'catalogo:artistas:participaciones' }
      ],
      'update-activity'
    )
  })

  test('keeps festival-list and catalog predicates independent for charla and inactive workshop changes', async () => {
    existingActivity = {
      participacionId: 11,
      tipoActividadId: 1,
      modoIngresoId: 1,
      estado: 'seleccionado',
      puntaje: null,
      notas: 'anterior',
      participacion: { edicionId: 7 },
      tipoActividad: { slug: 'charla' }
    }
    newActivityType = { slug: 'taller' }

    const result = await updateActivityAction({
      ...payload,
      tipoActividadId: 2,
      estado: 'seleccionado',
      modoIngresoId: 1
    })

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        {
          tag: FESTIVALES_CACHE_TAG,
          mode: 'swr'
        }
      ],
      'update-activity'
    )
  })

  test('attaches both festival pages when a music activity becomes public', async () => {
    existingActivity = {
      participacionId: 11,
      tipoActividadId: 1,
      modoIngresoId: 1,
      estado: 'seleccionado',
      puntaje: null,
      notas: 'anterior',
      participacion: { edicionId: 7 },
      tipoActividad: { slug: 'musica' }
    }
    newActivityType = { slug: 'musica' }

    const result = await updateActivityAction({
      ...payload,
      tipoActividadId: 1,
      modoIngresoId: 1,
      estado: 'confirmado'
    })

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        },
        {
          tag: FESTIVALES_CACHE_TAG,
          mode: 'swr'
        },
        { tag: 'catalogo:artistas' },
        { tag: 'catalogo:artistas:participaciones' }
      ],
      'update-activity'
    )
  })

  test('does not invalidate caches when the database mutation fails', async () => {
    failMutation = true
    const result = await updateActivityAction(payload)

    expect(result.success).toBe(false)
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('does not return until the batch has completed', async () => {
    let releaseBatch!: () => void
    let notifyBatchStarted!: () => void
    batchBarrier = new Promise<void>((resolve) => {
      releaseBatch = resolve
    })
    const started = new Promise<void>((resolve) => {
      notifyBatchStarted = resolve
    })
    batchStarted = notifyBatchStarted

    let settled = false
    const action = updateActivityAction(payload).finally(() => {
      settled = true
    })
    const progress = await Promise.race([
      started.then(() => 'batch-started'),
      action.then(() => 'action-settled')
    ])

    expect(progress).toBe('batch-started')
    expect(settled).toBe(false)
    releaseBatch()
    const result = await action
    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
  })
})
