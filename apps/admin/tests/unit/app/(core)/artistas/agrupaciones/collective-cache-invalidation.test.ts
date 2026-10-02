import { beforeEach, describe, expect, mock, test } from 'bun:test'

const invalidations: unknown[] = []
const updateTag = mock((_tag: string) => {})
let mutationRows: { id: number }[] = [{ id: 1 }]
let failInsert = false

const db = {
  insert: () => ({
    values: async () => {
      if (failInsert) throw new Error('insert failed')
    }
  }),
  update: () => ({
    set: () => ({
      where: () => ({ returning: async () => mutationRows })
    })
  })
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth: async () => ({}) }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort: (options: unknown) => {
    invalidations.push(options)
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

beforeEach(() => {
  invalidations.length = 0
  updateTag.mockClear()
  mutationRows = [{ id: 1 }]
  failInsert = false
})

describe('collective mutation catalog cache invalidation', () => {
  test('invalidates base, participation, and legacy tags after collective creation', async () => {
    const result = await createCollectiveAction({ success: false }, {
      nombre: 'Collective', descripcion: null, correo: null, activo: true
    } as never)

    expect(result.success).toBe(true)
    expect(invalidations).toEqual(expectedCatalogInvalidations)
  })

  test('invalidates both specific and legacy tags only after an effective delete', async () => {
    mutationRows = []
    const noOp = await deleteCollectiveAction(1)
    expect(noOp.success).toBe(true)
    expect(invalidations).toEqual([])

    mutationRows = [{ id: 1 }]
    const deleted = await deleteCollectiveAction(1)
    expect(deleted.success).toBe(true)
    expect(invalidations).toEqual(expectedCatalogInvalidations)
  })

  test('invalidates both specific and legacy tags only after an effective restore', async () => {
    mutationRows = []
    const noOp = await restoreCollectiveAction(1)
    expect(noOp.success).toBe(true)
    expect(invalidations).toEqual([])

    mutationRows = [{ id: 1 }]
    const restored = await restoreCollectiveAction(1)
    expect(restored.success).toBe(true)
    expect(invalidations).toEqual(expectedCatalogInvalidations)
  })

  test('does not invalidate when collective creation fails', async () => {
    failInsert = true
    const result = await createCollectiveAction({ success: false }, {
      nombre: 'Collective', descripcion: null, correo: null, activo: true
    } as never)

    expect(result.success).toBe(false)
    expect(invalidations).toEqual([])
  })
})
