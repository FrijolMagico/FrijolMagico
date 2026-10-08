import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FESTIVAL_CRITICAL_CACHE_TAG } from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const revalidateWebCacheBestEffort = mock(async (_options: unknown) => {})
const revalidateWebCacheBatch = mock(
  async (_requests: unknown, _context: string) => ({
    webRevalidation: 'immediate' as const
  })
)
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
let failUpdate = false
const where = mock(async () => {
  if (failUpdate) throw new Error('database update failed')
})
const set = mock(() => ({ where }))
const update = mock(() => ({ set }))

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBatch,
  revalidateWebCacheBestEffort
}))
mock.module('@frijolmagico/database/orm', () => ({ db: { update } }))

const { updateActivityDetailAction } = await import(
  '@/core/eventos/participaciones/_actions/activities/update-activity-detail.action'
)

describe('activity detail Web invalidation', () => {
  beforeEach(() => {
    updateTag.mockClear()
    revalidateWebCacheBestEffort.mockClear()
    revalidateWebCacheBatch.mockReset()
    revalidateWebCacheBatch.mockResolvedValue({ webRevalidation: 'immediate' })
    update.mockClear()
    set.mockClear()
    where.mockClear()
    failUpdate = false
  })

  test('updates the detail and invalidates only festival-critical data immediately', async () => {
    const result = await updateActivityDetailAction(11, {
      id: 22,
      titulo: 'Updated title',
      descripcion: null,
      duracionMinutos: null,
      cupos: null,
      horaInicio: '',
      ubicacion: ''
    })

    expect(result).toEqual({ success: true, webRevalidation: 'immediate' })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        }
      ],
      'update-activity-detail'
    )
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(updateTag).toHaveBeenCalledTimes(1)
  })

  test('awaits the batch before returning and passes through its summary', async () => {
    let resolveBatch: (summary: { webRevalidation: 'immediate' }) => void = () => {}
    let startBatch: () => void = () => {}
    const batchStarted = new Promise<void>((resolve) => (startBatch = resolve))
    revalidateWebCacheBatch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveBatch = resolve
          startBatch()
        })
    )

    let actionSettled = false
    const actionPromise = updateActivityDetailAction(11, {
      id: 22,
      titulo: 'Updated title',
      descripcion: null,
      duracionMinutos: null,
      cupos: null,
      horaInicio: '',
      ubicacion: ''
    }).then((result) => {
      actionSettled = true
      return result
    })

    await Promise.race([batchStarted, actionPromise.then(() => undefined)])
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
    expect(actionSettled).toBe(false)

    resolveBatch({ webRevalidation: 'immediate' })
    expect(await actionPromise).toEqual({
      success: true,
      webRevalidation: 'immediate'
    })
  })

  test('does not invalidate when the database update fails', async () => {
    failUpdate = true

    const result = await updateActivityDetailAction(11, {
      id: 22,
      titulo: 'Updated title',
      descripcion: null,
      duracionMinutos: null,
      cupos: null,
      horaInicio: '',
      ubicacion: ''
    })

    expect(result.success).toBe(false)
    expect(updateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
  })
})
