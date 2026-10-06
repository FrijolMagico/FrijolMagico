import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const SRC = process.cwd() + '/src'

const DELETE_ACTION_PATH =
  SRC + '/app/(core)/artistas/bandas/_actions/delete-banda.action.ts'
const RESTORE_ACTION_PATH =
  SRC + '/app/(core)/artistas/bandas/_actions/restore-banda.action.ts'

const updateTag = mock(() => {})
const webInvalidations: unknown[] = []
const revalidateWebCacheBatch = mock(async (requests: unknown[]) => {
  webInvalidations.push(...requests)
  return { webRevalidation: 'immediate' as const }
})
let currentBandName = 'Los Andes'
let currentBandExists = true
const getSession = mock(async () => ({ user: { id: '1' } }))
const requireAuth = mock(async () => ({ user: { id: '1' } }))
const getUser = mock(async () => ({ id: '1' }))

type InsertState = {
  valuesArgs: unknown[]
}

type UpdateState = {
  setArgs: unknown[]
  whereArgs: unknown[]
}

function createDbMock() {
  const insertState: InsertState = { valuesArgs: [] }
  const updateState: UpdateState = { setArgs: [], whereArgs: [] }
  const transaction = {
    select: () => {
      const builder = {
        from: () => builder,
        where: async () =>
          currentBandExists ? [{ name: currentBandName }] : []
      }
      return builder
    },
    update: () => ({
      set: (...args: unknown[]) => {
        updateState.setArgs.push(...args)
        return {
          where: (...whereArgs: unknown[]) => {
            updateState.whereArgs.push(...whereArgs)
            return updateFailure
              ? Promise.reject(updateFailure)
              : Promise.resolve()
          }
        }
      }
    })
  }
  const db = {
    ...transaction,
    insert: () => ({
      values: (...args: unknown[]) => {
        insertState.valuesArgs.push(...args)
        return Promise.resolve()
      }
    }),
    transaction: (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction)
  }

  return { insertState, updateState, db }
}

let currentDb = createDbMock().db
let updateFailure: Error | null = null

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag: mock(() => {}), updateTag }))
mock.module('next/cache.js', () => ({ cacheTag: mock(() => {}), updateTag }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort: (options: unknown) => {
    webInvalidations.push(options)
  },
  revalidateWebCacheBatch
}))
mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))
mock.module('@frijolmagico/database/orm', () => ({
  db: new Proxy(
    {},
    {
      get: (_, prop) => currentDb[prop as keyof typeof currentDb]
    }
  )
}))

const { createBandaAction } =
  await import('@/core/artistas/bandas/_actions/create-banda.action')
const { updateBandaAction } =
  await import('@/core/artistas/bandas/_actions/update-banda.action')
const { deleteBandaAction } =
  await import('@/core/artistas/bandas/_actions/delete-banda.action')
const { restoreBandaAction } =
  await import('@/core/artistas/bandas/_actions/restore-banda.action')

describe('band actions', () => {
  beforeEach(() => {
    updateTag.mockClear()
    requireAuth.mockClear()
    revalidateWebCacheBatch.mockClear()
    webInvalidations.length = 0
    updateFailure = null
    currentBandName = 'Los Andes'
    currentBandExists = true
    currentDb = createDbMock().db
  })

  test('createBandaAction validates auth and invalidates active cache', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    const result = await createBandaAction({
      name: 'Los Andes',
      description: null,
      email: 'losandes@frijolmagico.cl',
      phone: null,
      city: 'La Serena',
      country: 'Chile',
      active: true
    })

    expect(result.success).toBe(true)
    expect(requireAuth).toHaveBeenCalledTimes(1)
    expect(dbMock.insertState.valuesArgs).toHaveLength(1)
    expect(updateTag).toHaveBeenCalledTimes(1)
  })

  test('updateBandaAction immediately invalidates festivals when the name changes', async () => {
    const result = await updateBandaAction({ id: 1, name: 'New Name' })

    expect(result).toEqual({ success: true, webRevalidation: 'immediate' })
    expect(updateTag).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        {
          tag: 'festivales:critico',
          mode: 'immediate',
          path: '/festivales/[slug]',
          pathType: 'page'
        }
      ],
      'update-banda'
    )
  })

  test('updateBandaAction does not invalidate festivals when the name is unchanged', async () => {
    const result = await updateBandaAction({ id: 1, name: 'Los Andes' })

    expect(result).toEqual({ success: true })
    expect(updateTag).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(webInvalidations).toEqual([])
  })

  test('updateBandaAction does not invalidate festivals when the name is omitted', async () => {
    const result = await updateBandaAction({ id: 1, description: 'Updated' })

    expect(result).toEqual({ success: true })
    expect(updateTag).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(webInvalidations).toEqual([])
  })

  test('updateBandaAction does not invalidate festivals when the band is missing', async () => {
    currentBandExists = false

    const result = await updateBandaAction({ id: 1, name: 'New Name' })

    expect(result).toEqual({ success: true })
    expect(updateTag).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(webInvalidations).toEqual([])
  })

  test('updateBandaAction does not invalidate festivals when the update fails', async () => {
    updateFailure = new Error('Update failed')

    const result = await updateBandaAction({ id: 1, name: 'New Name' })

    expect(result.success).toBe(false)
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(webInvalidations).toEqual([])
  })

  test('updateBandaAction rejects invalid input before touching the db', async () => {
    const dbMock = createDbMock()
    currentDb = dbMock.db

    const result = await updateBandaAction({
      id: 0,
      name: ''
    })

    expect(result.success).toBe(false)
    expect(dbMock.updateState.setArgs).toEqual([])
  })

  test('delete and restore actions require auth and invalidate both cache tags', () => {
    const deleteSource = readFileSync(DELETE_ACTION_PATH, 'utf8')
    const restoreSource = readFileSync(RESTORE_ACTION_PATH, 'utf8')

    expect(deleteSource).toContain('await requireAuth()')
    expect(deleteSource).toContain(
      'nextCache.updateTag?.(BAND_ACTIVE_CACHE_TAG)'
    )
    expect(deleteSource).toContain(
      'nextCache.updateTag?.(BAND_DELETED_CACHE_TAG)'
    )

    expect(restoreSource).toContain('await requireAuth()')
    expect(restoreSource).toContain(
      'nextCache.updateTag?.(BAND_ACTIVE_CACHE_TAG)'
    )
    expect(restoreSource).toContain(
      'nextCache.updateTag?.(BAND_DELETED_CACHE_TAG)'
    )
  })
})
