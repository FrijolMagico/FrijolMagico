import { createStore } from 'zustand/vanilla'

import type { AssetQueue, AssetQueueJob, AssetQueueSnapshot } from './queue'
import { ASSET_QUEUE_STATUS } from './queue'

export interface AssetQueueStore {
  /** Returns the current state snapshot. */
  getState: () => AssetQueueSnapshot

  /** Subscribe to state changes, optionally narrowed by a selector.
   *
   * Plain overload: `subscribe(listener)` — fires on every state change.
   * Selector overload: `subscribe(selector, listener, options?)` — fires only
   * when the selected value changes (default equality: `Object.is`).
   */
  subscribe: {
    (listener: (state: AssetQueueSnapshot) => void): () => void
    <T>(
      selector: (state: AssetQueueSnapshot) => T,
      listener: (selected: T) => void,
      options?: { equalityFn?: (a: T, b: T) => boolean },
    ): () => void
  }

  /** Tears down the bridge: unsubscribes from the queue, prevents further
   * state updates, and releases the underlying Zustand store. */
  destroy: () => void

  /** Delegates to `queue.enqueue` and syncs state reactively. */
  enqueue: AssetQueue['enqueue']
  /** Delegates to `queue.cancel` and syncs state reactively. */
  cancel: AssetQueue['cancel']
  /** Delegates to `queue.remove` and syncs state reactively. */
  remove: AssetQueue['remove']
  /** Delegates to `queue.retryUpload` and syncs state reactively. */
  retryUpload: AssetQueue['retryUpload']
  /** Delegates to `queue.retryPersistence` and syncs state reactively. */
  retryPersistence: AssetQueue['retryPersistence']
}

/** Wraps an `AssetQueue` in a vanilla Zustand store that reactively mirrors
 * queue state and exposes queue operations directly.
 *
 * Each call creates an **isolated instance** — pass the same queue to share
 * state, or different queues for independent state trees.
 *
 * @example
 * ```ts
 * const queue = createAssetQueue()
 * const store = createAssetQueueStore(queue)
 * store.subscribe((state) => console.log(state.jobs.length))
 * store.enqueue(target, entityId, preparedAsset)
 * ```
 */
export function createAssetQueueStore(
  queue: AssetQueue,
): AssetQueueStore {
  const store = createStore<AssetQueueSnapshot>(() => ({
    ...queue.getSnapshot(),
  }))

  let alive = true
  const unsubscribe = queue.subscribe(() => {
    if (alive) store.setState(queue.getSnapshot())
  })

  /** Custom selector-aware subscribe.
   *
   * Zustand v5 vanilla subscribe does not include the selector overload, so
   * we implement it here manually by wrapping the base listener-based
   * subscribe with equality-checked selector memoisation. */
  function subscribe(
    listener: (state: AssetQueueSnapshot) => void,
  ): () => void
  function subscribe<T>(
    selector: (state: AssetQueueSnapshot) => T,
    listener: (selected: T) => void,
    options?: { equalityFn?: (a: T, b: T) => boolean },
  ): () => void
  function subscribe<T>(
    selectorOrListener: ((state: AssetQueueSnapshot) => void) | ((state: AssetQueueSnapshot) => T),
    listener?: ((selected: T) => void) | ((state: AssetQueueSnapshot) => void),
    options?: { equalityFn?: (a: T, b: T) => boolean },
  ): () => void {
    // Plain listener overload
    if (listener === undefined) {
      return store.subscribe(selectorOrListener as (state: AssetQueueSnapshot) => void)
    }
    // Selector overload: wrap with equality check
    const selector = selectorOrListener as (state: AssetQueueSnapshot) => T
    const eq = options?.equalityFn ?? Object.is
    let prevSelected = selector(store.getState())
    return store.subscribe(() => {
      const nextSelected = selector(store.getState())
      if (!eq(prevSelected, nextSelected)) {
        prevSelected = nextSelected
        ;(listener as (selected: T) => void)(nextSelected)
      }
    })
  }

  return {
    getState: store.getState,

    subscribe: subscribe as unknown as AssetQueueStore['subscribe'],

    destroy: () => {
      alive = false
      unsubscribe()
    },

    enqueue: (
      ...args: Parameters<AssetQueue['enqueue']>
    ): ReturnType<AssetQueue['enqueue']> => queue.enqueue(...args),

    cancel: (jobId) => queue.cancel(jobId),
    remove: (jobId) => queue.remove(jobId),
    retryUpload: (jobId) => queue.retryUpload(jobId),
    retryPersistence: (jobId) => queue.retryPersistence(jobId),
  }
}

/* -------------------------------------------------------------------------- */
/*  Selector helpers                                                          */
/* -------------------------------------------------------------------------- */

export const selectActiveJobId = (state: AssetQueueSnapshot) =>
  state.activeJobId

export const selectQueueJobs = (state: AssetQueueSnapshot) => state.jobs

export const selectJobById =
  (jobId: string) =>
  (state: AssetQueueSnapshot): AssetQueueJob | null =>
    state.jobs.find((job) => job.jobId === jobId) ?? null

export const selectActiveJob = (
  state: AssetQueueSnapshot,
): AssetQueueJob | null =>
  state.activeJobId
    ? state.jobs.find((job) => job.jobId === state.activeJobId) ?? null
    : null

export const selectNextEnqueuedJob = (
  state: AssetQueueSnapshot,
): AssetQueueJob | null =>
  state.jobs.find((job) => job.status === ASSET_QUEUE_STATUS.ENQUEUED) ?? null
