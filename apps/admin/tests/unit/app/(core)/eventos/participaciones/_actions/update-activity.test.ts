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
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCacheBestEffort = mock(async (options: { tag?: string; mode?: string; path?: string; pathType?: string }) => {
  expect(committed).toBe(true)
  invalidations.push(`web:${options.tag}`)
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
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBestEffort }))

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
  updateTag.mockClear()
  revalidateWebCacheBestEffort.mockClear()
})

describe('updateActivityAction catalog freshness', () => {
  test('invalidates the web catalog only after a successful database mutation', async () => {
    const result = await updateActivityAction(payload)

    expect(result.success).toBe(true)
    expect(invalidations).toContain('web:catalogo:artistas')
    expect(invalidations).toContain('web:catalogo:artistas:participaciones')
    expect(invalidations).toContain('local:actividades:participacion:11')
    expect(invalidations).toContain('local:participaciones:edicion:7')
    expect(invalidations).toContain('local:artistas:detalle')
    expect(invalidations).toContain('local:festivales')
    expect(invalidations).toContain(`web:${FESTIVAL_CRITICAL_CACHE_TAG}`)
    expect(invalidations).toContain(`web:${FESTIVALES_CACHE_TAG}`)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr',
      path: '/festivales',
      pathType: 'page'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: 'catalogo:artistas' })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({ tag: 'catalogo:artistas:participaciones' })
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
    expect(invalidations).not.toContain('web:catalogo:artistas:participaciones')
  })

  test('does not attach festival pages for changes outside their public projections', async () => {
    const result = await updateActivityAction({ ...payload, tipoActividadId: 2, estado: 'confirmado', modoIngresoId: 3 })

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
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
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate',
      path: '/festivales/[slug]',
      pathType: 'page'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
  })

  test('does not invalidate caches when the database mutation fails', async () => {
    failMutation = true
    const result = await updateActivityAction(payload)

    expect(result.success).toBe(false)
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
