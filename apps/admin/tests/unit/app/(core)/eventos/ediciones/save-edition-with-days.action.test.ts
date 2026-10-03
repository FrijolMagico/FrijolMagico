import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG
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
let projectionSequence: (Record<string, unknown> | null)[] = []
const activeDisplay = {
  id: 1,
  slug: 'festival-I',
  event_name: 'Festival',
  edition_number: 'I',
  start_date: '2026-06-10',
  end_date: '2026-06-10',
  days: [{ fecha: '2026-06-10', lugar: 'Plaza' }]
}
const invalidations: string[] = []
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
mock.module('@frijolmagico/database/active-festival-display', () => ({
  getActiveFestivalDisplay: async () => projectionSequence.shift() ?? null,
  compareActiveFestivalDisplay: (before: unknown, after: unknown) =>
    JSON.stringify(before) !== JSON.stringify(after)
}))
mock.module('@/shared/lib/auth/utils', () => ({
  requireAuth: async () => ({ user: { id: 'admin-1' } })
}))
mock.module('@/shared/lib/utils', () => ({ toSlug: (value: string) => value }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache,
  revalidateWebCacheBestEffort
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
  projectionSequence = []
  invalidations.length = 0
  routeInvalidations.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
})

describe('saveEditionWithDaysAction catalog freshness', () => {
  test('invalidates active display when the changed edition is selected', async () => {
    projectionSequence = [activeDisplay, { ...activeDisplay, edition_number: 'II' }]
    const result = await saveEditionWithDaysAction(
      { success: true },
      { ...payload, numeroEdicion: 'II' }
    )

    expect(result.success).toBe(true)
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
    expect(routeInvalidations).toEqual([
      { path: '/festivales/[slug]', pathType: 'page' },
      { path: '/festivales', pathType: 'page' }
    ])
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
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

  test('invalidates active display when a selected edition date changes', async () => {
    projectionSequence = [activeDisplay, { ...activeDisplay, end_date: '2026-06-11' }]
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
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
    expect(routeInvalidations).toEqual([
      { path: '/festivales/[slug]', pathType: 'page' },
      { path: '/festivales', pathType: 'page' }
    ])
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
  })

  test('does not invalidate active display for an unchanged projection', async () => {
    projectionSequence = [activeDisplay, activeDisplay]
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
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('invalidates festival routes for name and poster changes without the root routes', async () => {
    await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      nombre: 'New name',
      posterUrl: '/poster.jpg'
    })

    expect(routeInvalidations).toEqual([
      { path: '/festivales/[slug]', pathType: 'page' },
      { path: '/festivales', pathType: 'page' }
    ])
  })

  test('keeps time and modality edits off the root routes', async () => {
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

    expect(routeInvalidations).toEqual([
      { path: '/festivales/[slug]', pathType: 'page' },
      { path: '/festivales', pathType: 'page' }
    ])
  })

  test('invalidates active display without root paths when the selected venue changes', async () => {
    projectionSequence = [activeDisplay, { ...activeDisplay, days: [{ fecha: '2026-06-10', lugar: 'Auditorio' }] }]
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

    expect(routeInvalidations).toEqual([
      { path: '/festivales/[slug]', pathType: 'page' },
      { path: '/festivales', pathType: 'page' }
    ])
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
  })

  test('invalidates active display when creating the first selected edition without root paths', async () => {
    projectionSequence = [null, activeDisplay]
    await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      id: null
    })

    expect(routeInvalidations).toEqual([
      { path: '/festivales/[slug]', pathType: 'page' },
      { path: '/festivales', pathType: 'page' }
    ])
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'page' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ path: '/', pathType: 'layout' })
  })

  test('does not treat a missing edition row on update as an edition change', async () => {
    existingEdition = undefined

    await saveEditionWithDaysAction({ success: true }, payload)

    expect(routeInvalidations).toEqual([])
  })

  test('does not invalidate active display when the transaction mutation fails', async () => {
    projectionSequence = [activeDisplay]
    failMutation = true
    const result = await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      numeroEdicion: 'II'
    })

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG,
      mode: 'immediate'
    })
  })
})
