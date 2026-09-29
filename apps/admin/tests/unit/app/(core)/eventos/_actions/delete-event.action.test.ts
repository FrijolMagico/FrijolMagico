import { beforeEach, describe, expect, mock, test } from 'bun:test'

let deletedRows: { id: number }[] = [{ id: 1 }]
let failDelete = false
let mutationCompleted = false
const updateTag = mock((tag: string) => {
  expect(mutationCompleted).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCache = mock(async ({ tag }: { tag: string }) => {
  expect(mutationCompleted).toBe(true)
  invalidations.push(`web:${tag}`)
  return { revalidated: true }
})
const invalidations: string[] = []
const db = {
  delete: () => ({
    where: () => ({
      returning: async () => {
        if (failDelete) throw new Error('database delete failed')
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
const { deleteEventAction } = await import(
  '@/core/eventos/_actions/delete-event.action'
)

beforeEach(() => {
  deletedRows = [{ id: 1 }]
  failDelete = false
  mutationCompleted = false
  invalidations.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
})

describe('deleteEventAction catalog freshness', () => {
  test('invalidates event and web catalog tags after deleting an event', async () => {
    const result = await deleteEventAction(1)

    expect(result.success).toBe(true)
    expect(invalidations).toContain('local:eventos')
    expect(invalidations).toContain('web:eventos')
    expect(invalidations).toContain('web:catalogo:artistas')
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'eventos' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas' })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
    expect(revalidateWebCache).toHaveBeenCalledTimes(4)
  })

  test('does not invalidate tags when the event ID does not exist', async () => {
    deletedRows = []
    const result = await deleteEventAction(1)

    expect(result.success).toBe(true)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
  })

  test('preserves the failure response and does not invalidate tags on database error', async () => {
    failDelete = true
    const result = await deleteEventAction(1)

    expect(result.success).toBe(false)
    expect(result.errors).toHaveLength(2)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
  })
})
