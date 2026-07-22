import {
  createAssetQueueStore,
  type AssetQueueStore
} from './asset-queue-store'
import { createAssetQueue, type AssetQueue } from './queue'

/**
 * The shared store deliberately omits `destroy`: its lifetime belongs to the
 * module, not to an individual avatar controller or React subscription.
 */
export type SharedAssetQueueStore = Omit<AssetQueueStore, 'destroy'>

export interface SharedAssetQueueRuntime {
  readonly queue: AssetQueue
  readonly store: SharedAssetQueueStore
}

const queue = createAssetQueue()
const queueStore = createAssetQueueStore(queue)

const store: SharedAssetQueueStore = Object.freeze({
  getState: queueStore.getState,
  subscribe: queueStore.subscribe,
  enqueue: queueStore.enqueue,
  cancel: queueStore.cancel,
  remove: queueStore.remove,
  retryUpload: queueStore.retryUpload,
  retryPersistence: queueStore.retryPersistence
})

const runtime: SharedAssetQueueRuntime = Object.freeze({ queue, store })

export function getSharedAssetQueue(): AssetQueue {
  return runtime.queue
}

export function getSharedAssetQueueStore(): SharedAssetQueueStore {
  return runtime.store
}

export function getSharedAssetQueueRuntime(): SharedAssetQueueRuntime {
  return runtime
}
