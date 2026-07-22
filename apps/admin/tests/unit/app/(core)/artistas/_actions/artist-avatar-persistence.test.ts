import { beforeEach, describe, expect, mock, test } from 'bun:test'

const updateTag = mock(() => {})
const cacheTag = mock(() => {})
const getSession = mock(async () => ({ user: { id: 'admin-1' } }))
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const getUser = mock(async () => ({ id: 'admin-1' }))

interface AvatarRecord {
  id: number
  artistaId: number
  imagenUrl: string
  artistAvatarVersion: string | null
}

interface DbState {
  events: string[]
  inserts: unknown[]
  orderByArgs: unknown[]
  rows: AvatarRecord[]
  updateValues: unknown[]
  updates: unknown[]
  limit: number | null
}

function createState(): DbState {
  return {
    events: [],
    inserts: [],
    orderByArgs: [],
    rows: [],
    updateValues: [],
    updates: [],
    limit: null
  }
}

function toAvatarReference(avatar: AvatarRecord) {
  return {
    id: avatar.id,
    artistaId: avatar.artistaId,
    path: avatar.imagenUrl,
    version: avatar.artistAvatarVersion
  }
}

function createCreateDb(state: DbState, returned = [{ id: 42 }]) {
  return {
    insert: () => ({
      values: (value: unknown) => ({
        returning: async () => {
          state.inserts.push(value)
          return returned
        }
      })
    })
  }
}

function createUploadDb(
  state: DbState,
  returnedAvatar: AvatarRecord,
  previousAvatar: AvatarRecord | null = null
) {
  const transaction = {
    update: () => {
      state.events.push('update')
      return {
        set: (value: unknown) => ({
          where: (...args: unknown[]) => {
            state.updates.push({ value, args })
            return {
              returning: async () => {
                state.events.push('old-avatar:returning')
                return previousAvatar
                  ? [
                      {
                        path: previousAvatar.imagenUrl,
                        version: previousAvatar.artistAvatarVersion
                      }
                    ]
                  : []
              }
            }
          }
        })
      }
    },
    insert: () => ({
      values: (value: unknown) => ({
        returning: async () => {
          state.events.push('new-avatar:returning')
          state.inserts.push(value)
          return [toAvatarReference(returnedAvatar)]
        }
      })
    })
  }

  return {
    transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      state.events.push('transaction:start')
      const result = await callback(transaction)
      state.events.push('transaction:commit')
      return result
    }
  }
}

function createRemoveDb(state: DbState, returnedAvatar: AvatarRecord | null) {
  const transaction = {
    update: () => {
      state.events.push('update')
      return {
        set: (value: unknown) => {
          state.events.push('set')
          state.updateValues.push(value)
          return {
            where: (..._args: unknown[]) => {
              state.events.push('where')
              return {
                returning: async () => {
                  state.events.push('returning')
                  return returnedAvatar
                    ? [toAvatarReference(returnedAvatar)]
                    : []
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      state.events.push('transaction:start')
      const result = await callback(transaction)
      state.events.push('transaction:commit')
      return result
    }
  }
}

function createReadDb(state: DbState, rows: AvatarRecord[]) {
  return {
    select: () => ({
      from: () => ({
        where: (..._args: unknown[]) => ({
          orderBy: (...orderByArgs: unknown[]) => {
            state.orderByArgs.push(...orderByArgs)
            return {
              limit: async (value: number) => {
                state.limit = value
                return rows.map(toAvatarReference)
              }
            }
          }
        })
      })
    })
  }
}

let currentDb: Record<string, unknown> = {}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag, updateTag }))
mock.module('next/cache.js', () => ({ cacheTag, updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: new Proxy(
    {},
    {
      get: (_, property) => currentDb[String(property)]
    }
  )
}))

const { createArtistaAction } =
  await import('@/core/artistas/_actions/create-artista.action')
const { uploadArtistAvatarAction } =
  await import('@/core/artistas/_actions/upload-artist-avatar.action')
const { removeArtistAvatarAction } =
  await import('@/core/artistas/_actions/remove-artist-avatar.action')
const { getArtistAvatar } =
  await import('@/core/artistas/_lib/get-artist-avatar')

const validArtist = {
  pseudonimo: 'Artista de prueba',
  nombre: 'Nombre',
  rut: null,
  telefono: null,
  correo: null,
  ciudad: null,
  pais: null,
  estadoId: 1,
  rrss: null,
  slug: 'artista-de-prueba'
}

const avatar = {
  id: 8,
  artistaId: 12,
  imagenUrl: 'artist-avatar/12/v1.webp',
  artistAvatarVersion: 'v1'
}

describe('artist avatar persistence', () => {
  beforeEach(() => {
    currentDb = {}
    updateTag.mockImplementation(() => {})
    updateTag.mockClear()
    cacheTag.mockClear()
    requireAuth.mockClear()
  })

  test('returns the persisted artist id', async () => {
    const state = createState()
    currentDb = createCreateDb(state)

    await expect(
      createArtistaAction({ success: false }, validArtist)
    ).resolves.toEqual({ success: true, data: { id: 42 } })
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(updateTag).toHaveBeenCalledTimes(1)
  })

  test('does not report a committed artist as failed when cache invalidation throws', async () => {
    const state = createState()
    currentDb = createCreateDb(state)
    updateTag.mockImplementation(() => {
      throw new Error('cache unavailable')
    })

    await expect(
      createArtistaAction({ success: false }, validArtist)
    ).resolves.toEqual({ success: true, data: { id: 42 } })
  })

  test('keeps artist creation errors independent from avatar persistence', async () => {
    const state = createState()
    currentDb = {
      insert: () => ({
        values: () => ({
          returning: async () => {
            throw new Error('database unavailable')
          }
        })
      })
    }

    const result = await createArtistaAction({ success: false }, validArtist)

    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toBe('database unavailable')
    expect(state.inserts).toHaveLength(0)
  })

  test('replaces the active avatar atomically', async () => {
    const state = createState()
    const replacement = {
      ...avatar,
      id: 9,
      imagenUrl: 'artist-avatar/12/v2.webp',
      artistAvatarVersion: 'v2'
    }
    currentDb = createUploadDb(state, replacement, avatar)

    await expect(
      uploadArtistAvatarAction({
        artistaId: 12,
        path: replacement.imagenUrl,
        version: replacement.artistAvatarVersion
      })
    ).resolves.toEqual({
      success: true,
      data: {
        ...toAvatarReference(replacement),
        oldAsset: {
          path: avatar.imagenUrl,
          version: avatar.artistAvatarVersion
        }
      }
    })
    expect(state.updates).toHaveLength(1)
    expect(state.inserts).toHaveLength(1)
    expect(state.events).toEqual([
      'transaction:start',
      'update',
      'old-avatar:returning',
      'new-avatar:returning',
      'transaction:commit'
    ])
  })

  test('persists a first avatar without returning cleanup data', async () => {
    const state = createState()
    currentDb = createUploadDb(state, avatar)

    await expect(
      uploadArtistAvatarAction({
        artistaId: 12,
        path: avatar.imagenUrl,
        version: avatar.artistAvatarVersion
      })
    ).resolves.toEqual({
      success: true,
      data: { ...toAvatarReference(avatar), oldAsset: null }
    })
  })

  test('rejects an invalid avatar reference without changing the database', async () => {
    const state = createState()
    currentDb = createUploadDb(state, avatar)

    const result = await uploadArtistAvatarAction({
      artistaId: 12,
      path: '',
      version: 'v1'
    })

    expect(result.success).toBe(false)
    expect(state.updates).toHaveLength(0)
    expect(state.inserts).toHaveLength(0)
  })

  test('does not report a committed avatar as failed when cache invalidation throws', async () => {
    const state = createState()
    currentDb = createUploadDb(state, avatar)
    updateTag.mockImplementation(() => {
      throw new Error('cache unavailable')
    })

    const result = await uploadArtistAvatarAction({
      artistaId: 12,
      path: avatar.imagenUrl,
      version: avatar.artistAvatarVersion
    })

    expect(result).toEqual({
      success: true,
      data: { ...toAvatarReference(avatar), oldAsset: null }
    })
    expect(state.updates).toHaveLength(1)
    expect(state.inserts).toHaveLength(1)
  })

  test('soft-deletes the matching active avatar before returning cleanup data', async () => {
    const state = createState()
    currentDb = createRemoveDb(state, avatar)

    await expect(
      removeArtistAvatarAction({
        artistaId: 12,
        path: avatar.imagenUrl,
        version: avatar.artistAvatarVersion
      })
    ).resolves.toEqual({
      success: true,
      data: {
        deleted: true,
        asset: {
          path: avatar.imagenUrl,
          version: avatar.artistAvatarVersion
        }
      }
    })
    expect(state.events).toEqual([
      'transaction:start',
      'update',
      'set',
      'where',
      'returning',
      'transaction:commit'
    ])
  })

  test('returns a conflict and skips cache invalidation when no active avatar matches', async () => {
    const state = createState()
    currentDb = createRemoveDb(state, null)

    await expect(
      removeArtistAvatarAction({
        artistaId: 12,
        path: 'artist-avatar/12/stale.webp',
        version: 'stale'
      })
    ).resolves.toEqual({
      success: false,
      errors: [
        {
          entityType: 'artist-avatar',
          message: 'No se encontró un avatar activo coincidente para eliminar'
        }
      ]
    })
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('rejects an invalid removal reference without opening a transaction', async () => {
    const state = createState()
    currentDb = createRemoveDb(state, avatar)

    const result = await removeArtistAvatarAction({
      artistaId: 12,
      path: '',
      version: 'v1'
    })

    expect(result.success).toBe(false)
    expect(state.events).toHaveLength(0)
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('keeps the committed removal success when cache invalidation throws', async () => {
    const state = createState()
    currentDb = createRemoveDb(state, avatar)
    updateTag.mockImplementation(() => {
      throw new Error('cache unavailable')
    })

    await expect(
      removeArtistAvatarAction({
        artistaId: 12,
        path: avatar.imagenUrl,
        version: avatar.artistAvatarVersion
      })
    ).resolves.toEqual({
      success: true,
      data: {
        deleted: true,
        asset: {
          path: avatar.imagenUrl,
          version: avatar.artistAvatarVersion
        }
      }
    })
  })

  test('returns the active avatar projection', async () => {
    const state = createState()
    currentDb = createReadDb(state, [avatar])

    await expect(getArtistAvatar(12)).resolves.toEqual(
      toAvatarReference(avatar)
    )
    expect(cacheTag).toHaveBeenCalledTimes(1)
  })

  test('returns null when no active avatar exists', async () => {
    const state = createState()
    currentDb = createReadDb(state, [])

    await expect(getArtistAvatar(12)).resolves.toBeNull()
  })

  test('limits active avatars with deterministic newest-first ordering', async () => {
    const newestAvatar = { ...avatar, id: 9, artistAvatarVersion: 'v2' }
    const state = createState()
    currentDb = createReadDb(state, [newestAvatar, avatar])

    await expect(getArtistAvatar(12)).resolves.toEqual(
      toAvatarReference(newestAvatar)
    )
    expect(state.orderByArgs).toHaveLength(2)
    expect(state.limit).toBe(1)
  })
})
