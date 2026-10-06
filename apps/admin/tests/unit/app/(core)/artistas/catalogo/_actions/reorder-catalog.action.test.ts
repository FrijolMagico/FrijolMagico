import { beforeEach, describe, expect, mock, test } from 'bun:test'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCacheBatch = mock(async () => ({}))
const catalogArtistTable = { id: 'catalog.id', orden: 'catalog.orden' }
const existingOrders = new Map<number, string | undefined>()
let databaseFailure: Error | null = null

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBatch }))
mock.module('@frijolmagico/database/schema', () => ({
  artist: { catalogArtist: catalogArtistTable }
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      if (databaseFailure) throw databaseFailure
      return callback({
        select: () => ({
          from: () => ({
            where: async (condition: unknown[]) => {
              const id = condition[1] as number
              const orden = existingOrders.get(id)
              return orden === undefined ? [] : [{ orden }]
            }
          })
        }),
        update: () => ({
          set: () => ({ where: async () => undefined })
        })
      })
    }
  }
}))
mock.module('drizzle-orm', () => ({
  eq: (...values: unknown[]) => values
}))

const { reorderCatalogAction } = await import(
  '@/core/artistas/catalogo/_actions/reorder-catalog.action'
)

beforeEach(() => {
  updateTag.mockClear()
  requireAuth.mockClear()
  revalidateWebCacheBatch.mockClear()
  revalidateWebCacheBatch.mockResolvedValue({})
  existingOrders.clear()
  databaseFailure = null
})

describe('reorderCatalogAction catalog invalidation', () => {
  test('awaits exactly the existing base and catalog requests when order changes', async () => {
    existingOrders.set(9, 'a0')
    revalidateWebCacheBatch.mockResolvedValue({ webRevalidation: 'swr' })

    await expect(reorderCatalogAction([{ id: 9, orden: 'a1' }])).resolves.toEqual({
      success: true,
      webRevalidation: 'swr',
    })

    expect(updateTag).toHaveBeenCalledTimes(2)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith([
      { tag: 'catalogo:artistas:base' },
      { tag: 'catalogo:artistas' },
    ], 'reorder-catalog')
  })

  test('does not invalidate or add metadata when submitted order is unchanged', async () => {
    existingOrders.set(9, 'a0')

    await expect(reorderCatalogAction([{ id: 9, orden: 'a0' }])).resolves.toEqual({
      success: true,
    })

    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('does not invalidate or add metadata when no row order changed', async () => {
    await expect(reorderCatalogAction([{ id: 9, orden: 'a0' }])).resolves.toEqual({
      success: true,
    })

    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })

  test('propagates database failure without cache effects', async () => {
    databaseFailure = new Error('Reorder failed')

    await expect(reorderCatalogAction([{ id: 9, orden: 'a1' }])).rejects.toThrow(
      'Reorder failed'
    )

    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
