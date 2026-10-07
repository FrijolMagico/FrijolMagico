import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

let committed = false
let failMutation = false
let existingParticipation: {
  id: number
  edicionId: number
  artistaId: number | null
  bandaId: number | null
  agrupacionId: number | null
} = { id: 11, edicionId: 7, artistaId: 5, bandaId: null, agrupacionId: null }
const localInvalidations: string[] = []
const batchCalls: { requests: unknown[]; context?: string }[] = []
let batchSummary: { webRevalidation?: 'swr' | 'immediate' } = { webRevalidation: 'swr' }
let batchBarrier: Promise<void> | undefined
let batchStarted: (() => void) | undefined
const updateTag = mock((tag: string) => {
  expect(committed).toBe(true)
  localInvalidations.push(tag)
})
const revalidateWebCacheBestEffort = mock(async () => {})
const revalidateWebCacheBatch = mock(async (requests: unknown[], context?: string) => {
  expect(committed).toBe(true)
  batchCalls.push({ requests, context })
  batchStarted?.()
  await batchBarrier
  return batchSummary
})
const tx = {
  query: {
    editionParticipation: {
      findFirst: async () => existingParticipation
    }
  },
  update: () => ({
    set: () => ({
      where: async () => {
        if (failMutation) throw new Error('database update failed')
      }
    })
  })
}
const db = {
  transaction: async (callback: (transaction: typeof tx) => Promise<void>) => {
    await callback(tx)
    committed = true
  }
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth: async () => ({ user: { id: 'admin-1' } }) }))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBestEffort, revalidateWebCacheBatch }))

const { updateParticipationAction } = await import(
  '@/core/eventos/participaciones/_actions/participations/update-participation.action'
)

const payload = {
  id: 11,
  edicionId: 8,
  artistaId: 5,
  bandaId: null,
  agrupacionId: null
}

beforeEach(() => {
  committed = false
  failMutation = false
  existingParticipation = { id: 11, edicionId: 7, artistaId: 5, bandaId: null, agrupacionId: null }
  localInvalidations.length = 0
  batchCalls.length = 0
  batchSummary = { webRevalidation: 'swr' }
  batchBarrier = undefined
  batchStarted = undefined
  updateTag.mockClear()
  revalidateWebCacheBatch.mockClear()
})

describe('updateParticipationAction cache freshness', () => {
  test('awaits an ordered batch for an edition change and returns SWR freshness', async () => {
    const result = await updateParticipationAction(payload)

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(localInvalidations).toContain('participaciones:edicion:7')
    expect(localInvalidations).toContain('participaciones:edicion:8')
    expect(localInvalidations).toContain('artistas:detalle')
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
        { tag: CATALOG_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG }
      ],
      'update-participation'
    )
    expect(batchCalls).toHaveLength(1)
  })

  test('batches relationship and catalog requests for an artist change', async () => {
    const result = await updateParticipationAction({ ...payload, edicionId: 7, artistaId: 9 })

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        },
        { tag: CATALOG_CACHE_TAG }
        { tag: CATALOG_PARTICIPATION_CACHE_TAG }
      ],
      'update-participation'
    )
  })

  test('keeps collective changes in both relationship and catalog predicates', async () => {
    const result = await updateParticipationAction({ ...payload, edicionId: 7, artistaId: null, agrupacionId: 13 })

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        },
        { tag: CATALOG_CACHE_TAG }
        { tag: CATALOG_PARTICIPATION_CACHE_TAG }
      ],
      'update-participation'
    )
  })

  test('does not batch when only the band relationship changes under existing predicates', async () => {
    existingParticipation = { ...existingParticipation, artistaId: null }
    const result = await updateParticipationAction({ ...payload, edicionId: 7, artistaId: null, bandaId: 12 })

    expect(result).toEqual({ success: true })
    expect(batchCalls).toEqual([])
  })

  test('does not invalidate caches when no values changed', async () => {
    const result = await updateParticipationAction({ ...payload, edicionId: 7 })

    expect(result).toEqual({ success: true })
    expect(localInvalidations).toEqual([])
    expect(batchCalls).toEqual([])
  })

  test('does not invalidate caches when the database mutation fails', async () => {
    failMutation = true
    const result = await updateParticipationAction(payload)

    expect(result.success).toBe(false)
    expect(localInvalidations).toEqual([])
    expect(batchCalls).toEqual([])
  })

  test('remains pending until the requested batch finishes', async () => {
    let releaseBatch!: () => void
    let notifyBatchStarted!: () => void
    batchBarrier = new Promise<void>((resolve) => {
      releaseBatch = resolve
    })
    const started = new Promise<void>((resolve) => {
      notifyBatchStarted = resolve
    })
    batchStarted = notifyBatchStarted

    let settled = false
    const action = updateParticipationAction(payload).finally(() => {
      settled = true
    })
    const progress = await Promise.race([
      started.then(() => 'batch-started'),
      action.then(() => 'action-settled')
    ])

    expect(progress).toBe('batch-started')
    expect(settled).toBe(false)
    releaseBatch()
    const result = await action
    expect(result.success).toBe(true)
  })
})
