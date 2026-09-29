import { beforeEach, describe, expect, mock, test } from 'bun:test'

let committed = false
let failMutation = false
const invalidations: string[] = []
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  invalidations.push(tag)
})
const revalidateWebCacheBestEffort = mock(async ({ tag }: { tag: string }) => {
  expect(committed).toBe(true)
  invalidations.push(tag)
})
const tx = {
  query: {
    editionParticipation: {
      findFirst: async () => ({ id: 11, edicionId: 7, artistaId: 5, bandaId: null, agrupacionId: null })
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

const { updateParticipationAction } = await import(
  '@/core/eventos/participaciones/_actions/participations/update-participation.action'
)

const payload = {
  id: 11,
  edicionId: 8,
  artistaId: 5,
  bandaId: null,
  agrupacionId: null
}

beforeEach(() => {
  committed = false
  failMutation = false
  invalidations.length = 0
  updateTag.mockClear()
  revalidateWebCacheBestEffort.mockClear()
})

describe('updateParticipationAction cache freshness', () => {
  test('invalidates the previous and new edition after a committed edition change', async () => {
    const result = await updateParticipationAction(payload)

    expect(result.success).toBe(true)
    expect(invalidations).toContain('participaciones:edicion:7')
    expect(invalidations).toContain('participaciones:edicion:8')
    expect(invalidations).toContain('catalogo:artistas')
    expect(invalidations).toContain('catalogo:artistas:participaciones')
  })

  test('does not invalidate caches when no values changed', async () => {
    const result = await updateParticipationAction({ ...payload, edicionId: 7 })

    expect(result.success).toBe(true)
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(invalidations).not.toContain('catalogo:artistas:participaciones')
  })

  test('does not invalidate caches when the database mutation fails', async () => {
    failMutation = true
    const result = await updateParticipationAction(payload)

    expect(result.success).toBe(false)
    expect(invalidations).toEqual([])
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })
})
