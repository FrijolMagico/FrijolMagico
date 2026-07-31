import { describe, expect, test } from 'bun:test'

import type {
  AssetQueueJob,
  AssetQueueSnapshot
} from '@/shared/assets-manager/client/queue'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'
import type { SharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import {
  createCatalogAvatarRecentCompletionBridge,
  createCatalogAvatarQueueObserver,
  findPendingArtistAvatarJob
} from '@/core/artistas/catalogo/_lib/catalog-avatar-queue-state'

const preparedAsset = {
  blob: new Blob(['avatar'], { type: 'image/webp' }),
  width: 800,
  height: 800,
  mimeType: 'image/webp' as const
}

function createJob(overrides: Partial<AssetQueueJob> = {}): AssetQueueJob {
  return {
    jobId: 'avatar-job',
    target: 'artist-avatar',
    entityId: '42',
    preparedAsset,
    preview: null,
    status: ASSET_QUEUE_STATUS.ENQUEUED,
    sentBytes: 0,
    totalBytes: 6,
    error: null,
    failedStep: null,
    ...overrides
  }
}

function createStore(initial: AssetQueueSnapshot) {
  let snapshot = initial
  const listeners = new Set<(state: AssetQueueSnapshot) => void>()

  const store = {
    getState: () => snapshot,
    subscribe(listener: (state: AssetQueueSnapshot) => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    enqueue: () => {
      throw new Error('enqueue is not used by this observer test')
    },
    cancel() {},
    remove() {},
    retryUpload: async () => {},
    retryPersistence: async () => {}
  } as unknown as SharedAssetQueueStore

  return {
    store,
    update(next: AssetQueueSnapshot) {
      snapshot = next
      for (const listener of listeners) listener(snapshot)
    }
  }
}

describe('catalog avatar queue state', () => {
  test('finds only a non-terminal artist-avatar job for the exact artist', () => {
    const exact = createJob()
    const unrelatedArtist = createJob({ jobId: 'other-artist', entityId: '99' })
    const unrelatedTarget = createJob({
      jobId: 'poster',
      target: 'edition-poster'
    })
    const completed = createJob({
      jobId: 'completed',
      status: ASSET_QUEUE_STATUS.COMPLETED
    })

    expect(
      findPendingArtistAvatarJob(
        {
          jobs: [unrelatedArtist, unrelatedTarget, completed, exact],
          activeJobId: null
        },
        42
      )?.jobId
    ).toBe('avatar-job')
    expect(
      findPendingArtistAvatarJob(
        {
          jobs: [unrelatedArtist, unrelatedTarget, completed],
          activeJobId: null
        },
        42
      )
    ).toBeNull()
  })

  test('does not lock Active for failed, cancelled, or completed exact jobs', () => {
    for (const status of [
      ASSET_QUEUE_STATUS.FAILED,
      ASSET_QUEUE_STATUS.CANCELLED,
      ASSET_QUEUE_STATUS.COMPLETED
    ]) {
      expect(
        findPendingArtistAvatarJob(
          { jobs: [createJob({ status })], activeJobId: null },
          '42'
        )
      ).toBeNull()
    }
  })

  test('refreshes once only when the exact job confirms persistence', () => {
    const pending = createJob({ status: ASSET_QUEUE_STATUS.PERSISTING })
    const { store, update } = createStore({
      jobs: [pending],
      activeJobId: pending.jobId
    })
    let refreshes = 0
    const observer = createCatalogAvatarQueueObserver({
      entityId: 42,
      store,
      onConfirmedPersistence: () => {
        refreshes += 1
      }
    })
    const bridge = createCatalogAvatarRecentCompletionBridge({ entityId: 42, store })
    const stopBridge = bridge.subscribe(() => {})

    const completed = { ...pending, status: ASSET_QUEUE_STATUS.COMPLETED }
    update({ jobs: [completed], activeJobId: null })
    update({ jobs: [completed], activeJobId: null })

    expect(refreshes).toBe(1)
    expect(bridge.getSnapshot()).toBe(true)
    bridge.clear()
    expect(bridge.getSnapshot()).toBe(false)
    stopBridge()
    observer.destroy()
  })

  test('does not refresh for another artist or a non-persisting terminal transition', () => {
    const pending = createJob({ status: ASSET_QUEUE_STATUS.UPLOADING })
    const { store, update } = createStore({
      jobs: [pending],
      activeJobId: pending.jobId
    })
    let refreshes = 0
    const observer = createCatalogAvatarQueueObserver({
      entityId: 42,
      store,
      onConfirmedPersistence: () => {
        refreshes += 1
      }
    })

    update({
      jobs: [
        { ...pending, status: ASSET_QUEUE_STATUS.COMPLETED },
        createJob({
          jobId: 'other-completed',
          entityId: '99',
          status: ASSET_QUEUE_STATUS.COMPLETED
        })
      ],
      activeJobId: null
    })

    expect(refreshes).toBe(0)
    observer.destroy()
  })

})
