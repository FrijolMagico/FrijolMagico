import { beforeEach, describe, expect, mock, test } from 'bun:test'

let deletedRows: { id: number }[] = [{ id: 1 }]
let failDelete = false
let mutationCompleted = false
const invalidations: string[] = []
const updateTag = mock((tag: string) => {
  expect(mutationCompleted).toBe(true)
  invalidations.push(`local:${tag}`)
})
const revalidateWebCache = mock(async ({ tag }: { tag: string }) => {
  expect(mutationCompleted).toBe(true)
  invalidations.push(`web:${tag}`)
  return { revalidated: true }
})
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
const { deleteEditionAction } = await import(
  '@/core/eventos/ediciones/_actions/delete-edition.action'
)

beforeEach(() => {
  deletedRows = [{ id: 1 }]
  failDelete = false
  mutationCompleted = false
  invalidations.length = 0
  updateTag.mockClear()
  revalidateWebCache.mockClear()
})

describe('deleteEditionAction catalog freshness', () => {
  test('invalidates edition and web catalog tags after deleting an edition', async () => {
    const result = await deleteEditionAction({ success: true }, { id: 1 })

    expect(result.success).toBe(true)
    expect(invalidations).toContain('local:ediciones')
    expect(invalidations).toContain('local:ediciones:dias')
    expect(invalidations).toContain('web:ediciones')
    expect(invalidations).toContain('web:catalogo:artistas')
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'ediciones' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas' })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:participaciones'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas:fechas-edicion'
    })
    expect(revalidateWebCache).toHaveBeenCalledTimes(4)
  })

  test('does not invalidate tags when the edition ID does not exist', async () => {
    deletedRows = []
    const result = await deleteEditionAction({ success: true }, { id: 1 })

    expect(result.success).toBe(true)
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
  })

  test('preserves database errors and does not invalidate tags when deletion fails', async () => {
    failDelete = true

    await expect(
      deleteEditionAction({ success: true }, { id: 1 })
    ).rejects.toThrow('database delete failed')
    expect(invalidations).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalled()
  })
})
