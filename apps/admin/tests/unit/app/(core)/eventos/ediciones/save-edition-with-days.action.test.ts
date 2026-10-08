import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

let committed = false
let existingEdition: {
  eventoId: number
  numeroEdicion: string
  nombre: string | null
  posterUrl: string | null
  slug: string
} | undefined = {
  eventoId: 2,
  numeroEdicion: 'I',
  nombre: null,
  posterUrl: null,
  slug: 'festival-I'
}
let existingDates: {
  id: number
  fecha: string
  horaInicio: string
  horaFin: string
  modalidad: string | null
  lugarId: number | null
}[] = []
const routeInvalidations: { path: string; pathType: 'page' | 'layout' }[] = []
let failMutation = false
let transactionSelectCount = 0
const invalidations: string[] = []
const batchCalls: {
  requests: {
    tag?: string
    mode?: 'immediate' | 'swr'
    path?: string
    pathType?: 'page' | 'layout'
  }[]
  context?: string
}[] = []
let batchResult: { webRevalidation?: 'immediate' | 'swr' } = {
  webRevalidation: 'swr'
}
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCache = mock(async (input: {
  tag?: string
  mode?: 'immediate' | 'swr'
  path?: string
  pathType?: 'page' | 'layout'
}) => {
  expect(committed).toBe(true)
  if (input.tag) invalidations.push(`web:${input.tag}:${input.mode}`)
  if (input.path && input.pathType) {
    routeInvalidations.push({ path: input.path, pathType: input.pathType })
  }
  return { revalidated: true }
})
const revalidateWebCacheBestEffort = mock(async ({ tag }: { tag: string }) => {
  expect(committed).toBe(true)
  invalidations.push(`web:${tag}`)
})
const revalidateWebCacheBatch = mock(async (
  requests: typeof batchCalls[number]['requests'],
  context?: string
) => {
  expect(committed).toBe(true)
  batchCalls.push({ requests, context })
  invalidations.push('batch')
  for (const request of requests) {
    if (
      request.tag === FESTIVAL_CRITICAL_CACHE_TAG ||
      request.tag === FESTIVALES_CACHE_TAG
    ) {
      await revalidateWebCache(request)
    } else if (request.tag) {
      await revalidateWebCacheBestEffort({ tag: request.tag })
    } else {
      routeInvalidations.push({
        path: request.path!,
        pathType: request.pathType!
      })
    }
  }
  return batchResult
})

function makeQuery<T>(rows: T[]) {
  return {
    limit: async () => rows,
    then: (resolve: (value: T[]) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(rows).then(resolve, reject)
  }
}

const tx = {
  select: () => ({
    from: () => ({
      where: () => {
        transactionSelectCount += 1
        if (transactionSelectCount === 1) {
          return makeQuery(existingEdition ? [existingEdition] : [])
        }
        return makeQuery(existingDates)
      }
    })
  }),
  update: () => ({
    set: () => ({
      where: async () => {
        if (failMutation) throw new Error('database update failed')
      }
    })
  }),
  delete: () => ({
    where: async () => {
      if (failMutation) throw new Error('database update failed')
    }
  }),
  insert: () => ({
    values: () => ({
      returning: async () => [{ id: 10 }]
    })
  })
}
const db = {
  select: () => ({
    from: () => ({
      where: () => ({ limit: async () => [{ slug: 'festival' }] })
    })
  }),
  transaction: async (callback: (transaction: typeof tx) => Promise<void>) => {
    await callback(tx)
    committed = true
  }
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({
  requireAuth: async () => ({ user: { id: 'admin-1' } })
}))
mock.module('@/shared/lib/utils', () => ({ toSlug: (value: string) => value }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort,
  revalidateWebCacheBatch
}))

const { saveEditionWithDaysAction } = await import(
  '@/core/eventos/ediciones/_actions/save-edition-with-days.action'
)

const payload = {
  id: 10,
  eventoId: 2,
  numeroEdicion: 'I',
  nombre: null,
  posterUrl: null,
  days: []
}

beforeEach(() => {
  committed = false
  existingEdition = {
    eventoId: 2,
    numeroEdicion: 'I',
    nombre: null,
    posterUrl: null,
    slug: 'festival-I'
  }
  existingDates = []
  failMutation = false
  transactionSelectCount = 0
  invalidations.length = 0
  routeInvalidations.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  revalidateWebCacheBatch.mockClear()
  batchCalls.length = 0
  batchResult = { webRevalidation: 'swr' }
})

describe('saveEditionWithDaysAction catalog freshness', () => {
  test('awaits the exact ordered batch and returns its optional freshness metadata', async () => {
    const result = await saveEditionWithDaysAction(
      { success: true },
      { ...payload, numeroEdicion: 'II' }
    )

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(batchCalls).toEqual([
      {
        context: 'save-edition-with-days',
        requests: [
          { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
          { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
          { tag: 'catalogo:artistas' },
          { tag: 'catalogo:artistas:participaciones' }
        ]
      }
    ])
    expect(invalidations.slice(0, 2)).toEqual([
      'local:ediciones',
      'local:ediciones:dias'
    ])
    expect(invalidations.slice(0, 3)).toEqual([
      'local:ediciones',
      'local:ediciones:dias',
      'batch'
    ])
  })

  test('invalidates the web catalog when the edition number changes', async () => {
    const result = await saveEditionWithDaysAction(
      { success: true },
      { ...payload, numeroEdicion: 'II' }
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
    expect(routeInvalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
    expect(invalidations).toContain('local:ediciones')
    expect(invalidations).toContain('local:ediciones:dias')
  })

  test('invalidates the web catalog when the event association changes', async () => {
    const result = await saveEditionWithDaysAction(
      { success: true },
      { ...payload, eventoId: 3 }
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas'
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
  })

  test('invalidates only edition-date catalog data when a date changes', async () => {
    existingDates = [
      {
        id: 9,
        fecha: '2026-06-10',
        horaInicio: '10:00',
        horaFin: '18:00',
        modalidad: 'presencial',
        lugarId: null
      }
    ]
    const result = await saveEditionWithDaysAction(
      { success: true },
      {
        ...payload,
        days: [
          {
            tempId: 'day-1',
            existingId: 9,
            fecha: '2026-06-11',
            horaInicio: '10:00',
            horaFin: '18:00',
            modalidad: 'presencial',
            lugarId: null
          }
        ]
      }
    )

    expect(result.success).toBe(true)
    expect(batchCalls[0]?.requests).toEqual([
      { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
      { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
      { tag: 'catalogo:artistas:fechas-edicion' }
    ])
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
    expect(routeInvalidations).toEqual([])
  })

  test('preserves no-op handling when projected edition fields and dates are unchanged', async () => {
    const result = await saveEditionWithDaysAction({ success: true }, payload)

    expect(result.success).toBe(true)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
    expect(routeInvalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('retains festival tags for name and poster changes without route invalidation', async () => {
    await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      nombre: 'New name',
      posterUrl: '/poster.jpg'
    })

    expect(batchCalls[0]?.requests.slice(0, 2)).toEqual([
      { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
      { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
    ])
    expect(routeInvalidations).toEqual([])
  })

  test('keeps time and modality edits free of route invalidations', async () => {
    existingDates = [
      {
        id: 9,
        fecha: '2026-06-10',
        horaInicio: '10:00',
        horaFin: '18:00',
        modalidad: 'presencial',
        lugarId: null
      }
    ]

    await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      days: [
        {
          tempId: 'day-1',
          existingId: 9,
          fecha: '2026-06-10',
          horaInicio: '11:00',
          horaFin: '19:00',
          modalidad: 'online',
          lugarId: null
        }
      ]
    })

    expect(routeInvalidations).toEqual([])
  })

  test('retains tag invalidation when the venue changes', async () => {
    existingDates = [
      {
        id: 9,
        fecha: '2026-06-10',
        horaInicio: '10:00',
        horaFin: '18:00',
        modalidad: 'presencial',
        lugarId: 4
      }
    ]

    await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      days: [
        {
          tempId: 'day-1',
          existingId: 9,
          fecha: '2026-06-10',
          horaInicio: '10:00',
          horaFin: '18:00',
          modalidad: 'presencial',
          lugarId: 5
        }
      ]
    })

    expect(routeInvalidations).toEqual([])
  })

  test('invalidates festival tags and catalog tags when creating an edition', async () => {
    await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      id: null
    })

    expect(batchCalls[0]?.requests.slice(0, 2)).toEqual([
      { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
      { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
    ])
    expect(routeInvalidations).toEqual([])
  })

  test('does not treat a missing edition row on update as an edition change', async () => {
    existingEdition = undefined

    const result = await saveEditionWithDaysAction({ success: true }, payload)

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(batchCalls[0]?.requests).toEqual([
      { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
      { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
    ])
    expect(routeInvalidations).toEqual([])
  })

  test('omits freshness metadata when the batch has no summary', async () => {
    batchResult = {}

    const result = await saveEditionWithDaysAction({ success: true }, payload)

    expect(result).toEqual({ success: true })
    expect(batchCalls).toHaveLength(1)
  })

  test('passes through the requested SWR summary for an unchanged edition', async () => {
    const result = await saveEditionWithDaysAction({ success: true }, payload)

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(batchCalls).toHaveLength(1)
    expect(routeInvalidations).toEqual([])
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVALES_CACHE_TAG,
      mode: 'swr'
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('does not invalidate the web catalog when the transaction fails', async () => {
    failMutation = true
    const result = await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      numeroEdicion: 'II'
    })

    expect(result.success).toBe(false)
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
