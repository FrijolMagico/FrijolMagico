import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const DELETE_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/bandas/_actions/delete-banda.action.ts'
const RESTORE_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/bandas/_actions/restore-banda.action.ts'

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: '1' } }))

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

  return {
    insertState,
    updateState,
    db: {
      insert: () => ({
        values: (...args: unknown[]) => {
          insertState.valuesArgs.push(...args)
          return Promise.resolve()
        }
      }),
      update: () => ({
        set: (...args: unknown[]) => {
          updateState.setArgs.push(...args)
          return {
            where: (...whereArgs: unknown[]) => {
              updateState.whereArgs.push(...whereArgs)
              return Promise.resolve()
            }
          }
        }
      })
    }
  }
}

let currentDb = createDbMock().db

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('next/cache.js', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
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
