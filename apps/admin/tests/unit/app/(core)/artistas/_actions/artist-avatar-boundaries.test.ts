import { beforeEach, describe, expect, mock, test } from 'bun:test'

const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const getSession = mock(async () => ({ user: { id: 'admin-1' } }))
const getUser = mock(async () => ({ id: 'admin-1' }))
const deleteObject = mock(async () => {})

interface AvatarRecord {
  id: number
  artistaId: number
  path: string
  version: string
}

let rows: AvatarRecord[][] = []
let transactionError: Error | null = null
let transactionCalls = 0
let transactionImplementation:
  ((callback: (tx: unknown) => Promise<unknown>) => Promise<unknown>) | null =
  null

function select() {
  return {
    from: () => ({
      where: () => ({
        limit: async () => rows.shift() ?? []
      })
    })
  }
}

const db = {
  select,
  transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
    transactionCalls++
    if (transactionError) throw transactionError
    if (transactionImplementation) return transactionImplementation(callback)
    throw new Error('Unexpected transaction')
  }
}

mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))
mock.module('@/shared/assets-manager/server/r2-adapter', () => ({
  R2Adapter: mock(() => ({ deleteObject })),
  createR2Config: mock(() => ({}))
}))

const { createArtistAvatarUploadReceipt } =
  await import('@/core/artistas/catalogo/_lib/artist-avatar-upload-receipt')
const { persistArtistAvatarAction } =
  await import('@/core/artistas/_actions/persist-artist-avatar.action')
const { discardArtistAvatarAction } =
  await import('@/core/artistas/_actions/discard-artist-avatar.action')

const secret = 'test-receipt-secret'
const claims = {
  subjectId: 'admin-1',
  artistaId: 42,
  path: 'artistas/42/avatar-v1.webp',
  version: 'v1',
  expectedActive: undefined,
  catalogId: undefined,
  requestedActive: undefined
}

function receipt(issuedAt = Date.now()) {
  return createArtistAvatarUploadReceipt(claims, secret, issuedAt)
}

describe('artist avatar persistence boundaries', () => {
  beforeEach(() => {
    process.env.ASSET_RECEIPT_SECRET = secret
    rows = []
    transactionError = null
    transactionCalls = 0
    transactionImplementation = null
    requireAuth.mockReset()
    requireAuth.mockResolvedValue({ user: { id: 'admin-1' } })
    deleteObject.mockClear()
  })

  test('rejects forged and owner-mismatched persistence receipts before database mutation', async () => {
    const authentic = receipt()
    const forged = `${authentic.slice(0, -1)}x`

    await expect(
      persistArtistAvatarAction({ receipt: forged })
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'INVALID_RECEIPT', message: 'INVALID_RECEIPT' }]
    })
    requireAuth.mockResolvedValueOnce({ user: { id: 'other-admin' } })
    await expect(
      persistArtistAvatarAction({ receipt: authentic })
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'INVALID_RECEIPT', message: 'INVALID_RECEIPT' }]
    })
    expect(transactionCalls).toBe(0)
  })

  test('maps a missing receipt secret to INVALID_RECEIPT before persistence mutation', async () => {
    delete process.env.ASSET_RECEIPT_SECRET

    await expect(
      persistArtistAvatarAction({ receipt: receipt() })
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'INVALID_RECEIPT', message: 'INVALID_RECEIPT' }]
    })
    expect(transactionCalls).toBe(0)
  })

  test('does not reach either boundary when action authentication is refused', async () => {
    requireAuth.mockRejectedValueOnce(new Error('Unauthorized'))
    requireAuth.mockRejectedValueOnce(new Error('Unauthorized'))

    await expect(
      persistArtistAvatarAction({ receipt: receipt() })
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'artist-avatar', message: 'Unauthorized' }]
    })
    await expect(
      discardArtistAvatarAction({ receipt: receipt() })
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'artist-avatar', message: 'Unauthorized' }]
    })
    expect(transactionCalls).toBe(0)
    expect(deleteObject).not.toHaveBeenCalled()
  })

  test('recovers the exact committed result before creating another avatar', async () => {
    rows = [
      [{ id: 7, artistaId: 42, path: claims.path, version: claims.version }]
    ]

    await expect(
      persistArtistAvatarAction({ receipt: receipt() })
    ).resolves.toEqual({
      success: true,
      data: {
        id: 7,
        artistaId: 42,
        path: claims.path,
        version: claims.version,
        oldAsset: null
      }
    })
    expect(transactionCalls).toBe(0)
  })

  test('recovers a committed result after an ambiguous transaction response', async () => {
    rows = [
      [],
      [{ id: 8, artistaId: 42, path: claims.path, version: claims.version }]
    ]
    transactionError = new Error('connection reset after commit')

    await expect(
      persistArtistAvatarAction({ receipt: receipt() })
    ).resolves.toEqual({
      success: true,
      data: {
        id: 8,
        artistaId: 42,
        path: claims.path,
        version: claims.version,
        oldAsset: null
      }
    })
    expect(transactionCalls).toBe(1)
  })

  test('accepts an authentic expired receipt only to discard an unpersisted provisional object', async () => {
    rows = [[]]

    await expect(
      discardArtistAvatarAction({ receipt: receipt(0) })
    ).resolves.toEqual({ success: true, data: null })
    expect(deleteObject).toHaveBeenCalledWith(claims.path)
  })

  test('does not discard an object whose receipt was already persisted', async () => {
    rows = [
      [{ id: 9, artistaId: 42, path: claims.path, version: claims.version }]
    ]

    await expect(
      discardArtistAvatarAction({ receipt: receipt() })
    ).resolves.toEqual({
      success: true,
      data: null
    })

    expect(deleteObject).not.toHaveBeenCalled()
  })

  test('preserves conditional activation at the persistence boundary', async () => {
    const updates: unknown[] = []
    rows = [[]]
    transactionImplementation = (callback) =>
      callback({
        update: () => ({
          set: (value: unknown) => ({
            where: () => {
              updates.push(value)
              return { returning: async () => [] }
            }
          })
        }),
        insert: () => ({
          values: () => ({
            returning: async () => [
              {
                id: 10,
                artistaId: 42,
                path: claims.path,
                version: claims.version
              }
            ]
          })
        })
      })

    await expect(
      persistArtistAvatarAction({
        receipt: createArtistAvatarUploadReceipt(
          { ...claims, catalogId: 3, requestedActive: true },
          secret
        )
      })
    ).resolves.toMatchObject({ success: true, data: { id: 10 } })

    expect(updates).toContainEqual({ activo: true })
  })

  test('preserves the active-avatar conflict policy at persistence', async () => {
    rows = [[]]
    transactionImplementation = (callback) =>
      callback({
        select: () => ({
          from: () => ({ where: () => ({ limit: async () => [{ id: 11 }] }) })
        })
      })

    await expect(
      persistArtistAvatarAction({
        receipt: createArtistAvatarUploadReceipt(
          { ...claims, expectedActive: null },
          secret
        )
      })
    ).resolves.toEqual({
      success: false,
      errors: [{ entityType: 'AVATAR_CONFLICT', message: 'AVATAR_CONFLICT' }]
    })
  })
})
