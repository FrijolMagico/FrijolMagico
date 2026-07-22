import { afterEach, describe, expect, test } from 'bun:test'

import { ASSET_TARGET } from '../../../../../src/shared/assets-manager/client/contracts'
import {
  getSharedAssetQueue,
  getSharedAssetQueueRuntime,
  getSharedAssetQueueStore
} from '../../../../../src/shared/assets-manager/client/shared-asset-queue'

const preparedAsset = {
  blob: new Blob(['prepared'], { type: 'image/webp' }),
  width: 800,
  height: 800,
  mimeType: 'image/webp' as const
}

function clearSharedQueue() {
  const queue = getSharedAssetQueue()

  for (const job of queue.getSnapshot().jobs) {
    if (
      job.status === 'enqueued' ||
      job.status === 'uploading' ||
      job.status === 'persisting'
    ) {
      queue.cancel(job.jobId)
    }

    queue.remove(job.jobId)
  }
}

describe('shared asset queue', () => {
  afterEach(clearSharedQueue)

  test('returns one queue and one store runtime for every consumer', () => {
    const runtime = getSharedAssetQueueRuntime()

    expect(getSharedAssetQueue()).toBe(runtime.queue)
    expect(getSharedAssetQueueStore()).toBe(runtime.store)
    expect(getSharedAssetQueue()).toBe(getSharedAssetQueue())
    expect(getSharedAssetQueueStore()).toBe(getSharedAssetQueueStore())
  })

  test('bridges the exact shared queue instance into the shared store', () => {
    const queue = getSharedAssetQueue()
    const store = getSharedAssetQueueStore()
    const job = queue.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'artist-1',
      preparedAsset
    )

    expect(store.getState()).toEqual(queue.getSnapshot())
    expect(store.getState().jobs[0]?.jobId).toBe(job.jobId)
  })

  test('keeps one active job across all shared accessors', () => {
    const queue = getSharedAssetQueue()
    const store = getSharedAssetQueueStore()
    const first = store.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'artist-1',
      preparedAsset
    )
    const second = queue.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'artist-2',
      preparedAsset
    )

    queue.startUpload(first.jobId)

    expect(store.getState().activeJobId).toBe(first.jobId)
    expect(getSharedAssetQueueRuntime().queue.getSnapshot().activeJobId).toBe(
      first.jobId
    )
    expect(() => queue.startUpload(second.jobId)).toThrow(
      'Illegal asset queue transition'
    )
  })

  test('does not expose global store teardown to consumers', () => {
    expect('destroy' in getSharedAssetQueueStore()).toBe(false)
  })
})
