import { beforeEach, describe, expect, mock, test } from 'bun:test'

const invalidations: unknown[] = []
const batchCalls: { requests: unknown[]; context?: string }[] = []
const legacyInvalidations: unknown[] = []
const updateTag = mock((_tag: string) => {})
let mutationRows: { id: number }[] = [{ id: 1 }]
let failInsert = false
let failUpdate = false
let failAuth = false
let webRevalidation: 'swr' | 'immediate' | undefined = 'swr'

const db = {
  insert: () => ({
    values: async () => {
      if (failInsert) throw new Error('insert failed')
    }
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: async () => {
          if (failUpdate) throw new Error('update failed')
          return mutationRows
        }
      })
    })
  })
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({
  requireAuth: async () => {
    if (failAuth) throw new Error('unauthorized')
    return {}
  }
}))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort: (options: unknown) => {
    legacyInvalidations.push(options)
  },
  revalidateWebCacheBatch: async (requests: unknown[], context?: string) => {
    batchCalls.push({ requests, context })
    invalidations.push(...requests)
    return webRevalidation ? { webRevalidation } : {}
  }
}))

const { createCollectiveAction } = await import(
  '@/core/artistas/agrupaciones/_actions/create-collective.action'
)
const { deleteCollectiveAction } = await import(
  '@/core/artistas/agrupaciones/_actions/delete-collective.action'
)
const { restoreCollectiveAction } = await import(
  '@/core/artistas/agrupaciones/_actions/restore-collective.action'
)

const expectedCatalogInvalidations = [
  { tag: 'catalogo:artistas:base' },
  { tag: 'catalogo:artistas:participaciones' },
  { tag: 'catalogo:artistas' }
]
const collectiveInput = {
  nombre: 'Collective', descripcion: null, correo: null, activo: true
}

beforeEach(() => {
  invalidations.length = 0
  batchCalls.length = 0
  legacyInvalidations.length = 0
  updateTag.mockClear()
  mutationRows = [{ id: 1 }]
  failInsert = false
  failUpdate = false
  failAuth = false
  webRevalidation = 'swr'
})

describe('collective mutation catalog cache invalidation', () => {
  test('awaits the three existing catalog tags after collective creation', async () => {
    const result = await createCollectiveAction({ success: false }, collectiveInput)

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(batchCalls).toHaveLength(1)
    expect(batchCalls[0]?.requests).toEqual(expectedCatalogInvalidations)
    expect(invalidations).toEqual(expectedCatalogInvalidations)
    expect(updateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'agrupacion',
      'agrupacion:activas'
    ])
    expect(legacyInvalidations).toEqual([])
  })

  test('batches existing catalog tags only after an effective delete', async () => {
    mutationRows = []
    const noOp = await deleteCollectiveAction(1)
    expect(noOp).toEqual({ success: true })
    expect(batchCalls).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()

    mutationRows = [{ id: 1 }]
    const deleted = await deleteCollectiveAction(1)
    expect(deleted).toEqual({ success: true, webRevalidation: 'swr' })
    expect(batchCalls).toHaveLength(1)
    expect(batchCalls[0]?.requests).toEqual(expectedCatalogInvalidations)
    expect(updateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'agrupacion',
      'agrupacion:activas',
      'agrupacion:eliminadas'
    ])
    expect(legacyInvalidations).toEqual([])
  })

  test('batches existing catalog tags only after an effective restore', async () => {
    mutationRows = []
    const noOp = await restoreCollectiveAction(1)
    expect(noOp).toEqual({ success: true })
    expect(batchCalls).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()

    mutationRows = [{ id: 1 }]
    const restored = await restoreCollectiveAction(1)
    expect(restored).toEqual({ success: true, webRevalidation: 'swr' })
    expect(batchCalls).toHaveLength(1)
    expect(batchCalls[0]?.requests).toEqual(expectedCatalogInvalidations)
    expect(updateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'agrupacion',
      'agrupacion:activas',
      'agrupacion:eliminadas'
    ])
    expect(legacyInvalidations).toEqual([])
  })

  test('does not invalidate when collective creation fails', async () => {
    failInsert = true
    const result = await createCollectiveAction({ success: false }, collectiveInput)

    expect(result.success).toBe(false)
    expect(batchCalls).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('keeps a successful database insert successful when the batch has no summary', async () => {
    webRevalidation = undefined
    const result = await createCollectiveAction({ success: false }, collectiveInput)

    expect(result).toEqual({ success: true })
    expect(batchCalls).toHaveLength(1)
    expect(batchCalls[0]?.requests).toEqual(expectedCatalogInvalidations)
    expect(updateTag).toHaveBeenCalledTimes(2)
  })

  test('does not invalidate for auth or input validation failures', async () => {
    failAuth = true
    const unauthorized = await createCollectiveAction(
      { success: false },
      collectiveInput
    )
    expect(unauthorized.success).toBe(false)
    expect(batchCalls).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()

    failAuth = false
    const invalid = await createCollectiveAction({ success: false }, {
      ...collectiveInput,
      nombre: ''
    })
    expect(invalid.success).toBe(false)
    expect(batchCalls).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('does not invalidate when a delete or restore database update fails', async () => {
    failUpdate = true
    const deleted = await deleteCollectiveAction(1)
    expect(deleted.success).toBe(false)
    expect(batchCalls).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()

    const restored = await restoreCollectiveAction(1)
    expect(restored.success).toBe(false)
    expect(batchCalls).toEqual([])
    expect(updateTag).not.toHaveBeenCalled()
  })
})
