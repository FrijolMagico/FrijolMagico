import { beforeEach, describe, expect, mock, test } from 'bun:test'

let committed = false
let existingEdition = { eventoId: 2, numeroEdicion: 'I' }
let existingDates: { fecha: string }[] = []
let failMutation = false
let transactionSelectCount = 0
const invalidations: string[] = []
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCache = mock(async ({ tag }: { tag: string }) => {
  expect(committed).toBe(true)
  invalidations.push(`web:${tag}`)
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
        return makeQuery<{
          fecha?: string
          eventoId?: number
          numeroEdicion?: string
        }>(transactionSelectCount === 1 ? [existingEdition] : existingDates)
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
  existingEdition = { eventoId: 2, numeroEdicion: 'I' }
  existingDates = []
  failMutation = false
  transactionSelectCount = 0
  invalidations.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
  revalidateWebCacheBestEffort.mockClear()
})

describe('saveEditionWithDaysAction catalog freshness', () => {
  test('invalidates the web catalog when the edition number changes', async () => {
    const result = await saveEditionWithDaysAction(
      { success: true },
      { ...payload, numeroEdicion: 'II' }
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
    existingDates = [{ fecha: '2026-06-10' }]
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
  })

  test('preserves no-op handling when projected edition fields and dates are unchanged', async () => {
    const result = await saveEditionWithDaysAction({ success: true }, payload)

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('does not invalidate the web catalog when the transaction fails', async () => {
    failMutation = true
    const result = await saveEditionWithDaysAction({ success: true }, {
      ...payload,
      numeroEdicion: 'II'
    })

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
