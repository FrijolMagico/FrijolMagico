import { describe, expect, test } from 'bun:test'

import { createAssetQueueStore } from '../../../../../src/shared/assets-manager/client/asset-queue-store'
import { createAssetQueue } from '../../../../../src/shared/assets-manager/client/queue'
import { ASSET_TARGET } from '../../../../../src/shared/assets-manager/client/contracts'

const preparedAsset = {
  blob: new Blob(['prepared'], { type: 'image/webp' }),
  width: 800,
  height: 800,
  mimeType: 'image/webp' as const,
}

describe('AssetQueueStore adapter', () => {
  test('initial state is empty — jobs: [], activeJobId: null', () => {
    const queue = createAssetQueue()
    const { getState, destroy } = createAssetQueueStore(queue)
    expect(getState()).toEqual({ jobs: [], activeJobId: null })
    destroy()
  })

  test('reactively syncs when queue notifies after enqueue', () => {
    const queue = createAssetQueue()
    const { getState, destroy } = createAssetQueueStore(queue)
    queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'edition', preparedAsset)
    expect(getState().jobs).toHaveLength(1)
    expect(getState().activeJobId).toBeNull()
    destroy()
  })

  test('subscribe listener fires on queue mutation', () => {
    const queue = createAssetQueue()
    const { subscribe, destroy } = createAssetQueueStore(queue)
    let callCount = 0
    subscribe(() => {
      callCount++
    })
    queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'edition', preparedAsset)
    expect(callCount).toBe(1)
    destroy()
  })

  test('destroy freezes state and post-destroy notifications are silent', () => {
    const queue = createAssetQueue()
    const { getState, destroy } = createAssetQueueStore(queue)
    queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'before', preparedAsset)
    expect(getState().jobs).toHaveLength(1)

    const frozen = getState()
    destroy()

    queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'after', preparedAsset)

    expect(getState()).toBe(frozen)
    expect(getState().jobs).toHaveLength(1)
  })

  test('enqueue delegates and syncs state', () => {
    const queue = createAssetQueue()
    const { enqueue, getState, destroy } = createAssetQueueStore(queue)
    const job = enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    expect(job).toBeDefined()
    expect(job.jobId).toBeTruthy()
    expect(getState().jobs).toHaveLength(1)
    expect(getState().jobs[0]?.jobId).toBe(job.jobId)
    destroy()
  })

  test('cancel delegates and syncs state', () => {
    const queue = createAssetQueue()
    const { enqueue, cancel, getState, destroy } = createAssetQueueStore(queue)
    const job = enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    queue.startUpload(job.jobId)
    cancel(job.jobId)

    expect(getState().jobs[0]?.status).toBe('cancelled')
    destroy()
  })

  test('remove delegates and syncs state', () => {
    const queue = createAssetQueue()
    const { enqueue, remove, getState, destroy } = createAssetQueueStore(queue)
    const job = enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    remove(job.jobId)

    expect(getState().jobs).toHaveLength(0)
    destroy()
  })

  test('retryUpload delegates correctly', async () => {
    const operations = { upload: async () => {} }
    const queue = createAssetQueue(() => crypto.randomUUID(), operations, { baseDelay: 0, timeout: 1000 })
    const { enqueue, retryUpload, getState, destroy } =
      createAssetQueueStore(queue)
    const job = enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    queue.startUpload(job.jobId)
    queue.fail(job.jobId, 'network error')
    expect(getState().jobs[0]?.status).toBe('failed')
    expect(getState().jobs[0]?.failedStep).toBe('upload')

    await retryUpload(job.jobId)
    // retryUpload transitions UPLOADING → (operation resolves) → PERSISTING
    expect(getState().jobs[0]?.status).toBe('persisting')
    destroy()
  })

  test('retryPersistence delegates correctly', async () => {
    const operations = { persist: async () => {} }
    const queue = createAssetQueue(() => crypto.randomUUID(), operations, { baseDelay: 0, timeout: 1000 })
    const { enqueue, retryPersistence, getState, destroy } =
      createAssetQueueStore(queue)
    const job = enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    queue.fail(job.jobId, 'db error')
    expect(getState().jobs[0]?.status).toBe('failed')
    expect(getState().jobs[0]?.failedStep).toBe('persist')

    await retryPersistence(job.jobId)
    expect(getState().jobs[0]?.status).toBe('completed')
    destroy()
  })

  test('subscribe with selector skips irrelevant changes', () => {
    const queue = createAssetQueue()
    const { subscribe, destroy } = createAssetQueueStore(queue)

    let activeChanges = 0
    subscribe(
      (s) => s.activeJobId,
      () => {
        activeChanges++
      },
    )

    // enqueue adds a job but activeJobId stays null → listener should NOT fire
    queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    expect(activeChanges).toBe(0)

    // another enqueue — still null activeJobId
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e2', preparedAsset)
    expect(activeChanges).toBe(0)

    // startUpload changes activeJobId from null → jobId → listener fires
    queue.startUpload(job.jobId)
    expect(activeChanges).toBe(1)
    destroy()
  })

  test('two factory instances maintain independent state', () => {
    const queueA = createAssetQueue()
    const queueB = createAssetQueue()
    const storeA = createAssetQueueStore(queueA)
    const storeB = createAssetQueueStore(queueB)

    storeA.enqueue(ASSET_TARGET.EDITION_POSTER, 'a', preparedAsset)
    storeB.enqueue(ASSET_TARGET.EDITION_POSTER, 'b', preparedAsset)
    storeB.enqueue(ASSET_TARGET.ARTIST_AVATAR, 'b2', preparedAsset)

    expect(storeA.getState().jobs).toHaveLength(1)
    expect(storeB.getState().jobs).toHaveLength(2)
    expect(storeA.getState().jobs[0]?.entityId).toBe('a')

    storeA.destroy()
    storeB.destroy()
  })
})
