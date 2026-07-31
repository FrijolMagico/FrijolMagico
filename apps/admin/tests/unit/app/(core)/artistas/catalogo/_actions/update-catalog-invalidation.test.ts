import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const revalidateWebCache = mock(async () => ({ revalidated: true }))

let dbTransaction: (
  cb: (tx: unknown) => Promise<unknown>
) => Promise<unknown> = async () => true

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCache }))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    transaction: (cb: (tx: unknown) => Promise<unknown>) => dbTransaction(cb)
  }
}))

const { updateCatalogAction } =
  await import('@/core/artistas/catalogo/_actions/update-catalog.action')

const validInput = {
  id: 1,
  artistaId: 42,
  descripcion: 'Descripción actualizada',
  activo: true,
  destacado: false,
  avatarUrl: null
}

function makeTx() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [] as never[]
        })
      })
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve()
      })
    })
  }
}

describe('update-catalog action — best-effort cache invalidation', () => {
  beforeEach(() => {
    updateTag.mockReset()
    requireAuth.mockReset()
    revalidateWebCache.mockReset()
    dbTransaction = async (cb) => {
      const result = await cb(makeTx())
      return result
    }
  })

  afterEach(() => {
    updateTag.mockReset()
  })

  test('returns success when cache invalidation throws', async () => {
    updateTag.mockImplementation(() => {
      throw new Error('cache unavailable')
    })

    const result = await updateCatalogAction({ success: false }, validInput)

    expect(result).toEqual({ success: true })
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(updateTag).toHaveBeenCalledTimes(1)
  })

  test('returns success when cache invalidation succeeds', async () => {
    const result = await updateCatalogAction({ success: false }, validInput)

    expect(result).toEqual({ success: true })
    expect(updateTag).toHaveBeenCalledTimes(1)
  })

  test('returns conflict when transaction returns null', async () => {
    dbTransaction = async () => null

    const result = await updateCatalogAction({ success: false }, validInput)

    expect(result).toEqual({
      success: false,
      errors: [{ entityType: 'AVATAR_CONFLICT', message: 'AVATAR_CONFLICT' }]
    })
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('triggers web revalidation after successful update', async () => {
    await updateCatalogAction({ success: false }, validInput)

    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: 'catalogo:artistas',
      path: '/catalogo'
    })
  })
})
