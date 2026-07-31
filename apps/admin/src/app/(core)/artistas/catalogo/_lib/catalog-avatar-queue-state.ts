import { useState, useSyncExternalStore } from 'react'

import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'
import type {
  AssetQueueJob,
  AssetQueueSnapshot,
  AssetQueueStatus
} from '@/shared/assets-manager/client/queue'
import {
  getSharedAssetQueueStore,
  type SharedAssetQueueStore
} from '@/shared/assets-manager/client/shared-asset-queue'

const TERMINAL_STATUSES: ReadonlySet<AssetQueueStatus> = new Set([
  ASSET_QUEUE_STATUS.COMPLETED,
  ASSET_QUEUE_STATUS.FAILED,
  ASSET_QUEUE_STATUS.CANCELLED
])

const refreshedJobIds = new Set<string>()

export function findPendingArtistAvatarJob(
  snapshot: AssetQueueSnapshot,
  entityId: string | number
): AssetQueueJob | null {
  const expectedEntityId = String(entityId)
  return (
    snapshot.jobs.find(
      (job) =>
        job.target === 'artist-avatar' &&
        job.entityId === expectedEntityId &&
        !TERMINAL_STATUSES.has(job.status)
    ) ?? null
  )
}

export interface CatalogAvatarQueueObserverOptions {
  entityId: string | number
  store?: SharedAssetQueueStore
  onConfirmedPersistence: () => void
}

export interface CatalogAvatarQueueObserver {
  destroy: () => void
}

export function createCatalogAvatarRecentCompletionBridge(options: Pick<CatalogAvatarQueueObserverOptions, 'entityId' | 'store'>) {
  const store = options.store ?? getSharedAssetQueueStore()
  const listeners = new Set<() => void>()
  let previousJobs = store.getState().jobs
  let hasRecentCompletion = false
  let unsubscribeStore: (() => void) | null = null
  const observe = (snapshot: AssetQueueSnapshot) => {
    if (snapshot.jobs.some((job) => {
      const previous = previousJobs.find((candidate) => candidate.jobId === job.jobId)
      return (
        job.target === 'artist-avatar' &&
        job.entityId === String(options.entityId) &&
        previous?.status === ASSET_QUEUE_STATUS.PERSISTING &&
        job.status === ASSET_QUEUE_STATUS.COMPLETED
      )
    })) {
      hasRecentCompletion = true
      listeners.forEach((listener) => listener())
    }
    previousJobs = snapshot.jobs
  }
  return {
    clear: () => { hasRecentCompletion = false },
    getSnapshot: () => hasRecentCompletion,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      if (listeners.size === 1) unsubscribeStore = store.subscribe(observe)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) unsubscribeStore?.()
      }
    }
  }
}

export function createCatalogAvatarQueueObserver(
  options: CatalogAvatarQueueObserverOptions
): CatalogAvatarQueueObserver {
  const store = options.store ?? getSharedAssetQueueStore()
  let previousJobs = store.getState().jobs

  const unsubscribe = store.subscribe((snapshot) => {
    for (const job of snapshot.jobs) {
      const previous = previousJobs.find(
        (candidate) => candidate.jobId === job.jobId
      )
      const isExactAvatar =
        job.target === 'artist-avatar' &&
        job.entityId === String(options.entityId)
      const confirmedPersistence =
        previous?.status === ASSET_QUEUE_STATUS.PERSISTING &&
        job.status === ASSET_QUEUE_STATUS.COMPLETED

      if (
        isExactAvatar &&
        confirmedPersistence &&
        !refreshedJobIds.has(job.jobId)
      ) {
        refreshedJobIds.add(job.jobId)
        options.onConfirmedPersistence()
      }
    }
    previousJobs = snapshot.jobs
  })

  return { destroy: unsubscribe }
}

export function useCatalogAvatarPending(
  entityId: string | number,
  store: SharedAssetQueueStore = getSharedAssetQueueStore()
): boolean {
  return useSyncExternalStore(
    (onStoreChange) => store.subscribe(onStoreChange),
    () => findPendingArtistAvatarJob(store.getState(), entityId) !== null,
    () => false
  )
}

export function useCatalogAvatarRecentCompletion(
  entityId: string | number,
  hasActiveAvatar: boolean,
  store: SharedAssetQueueStore = getSharedAssetQueueStore()
): boolean {
  const [bridge] = useState(() => createCatalogAvatarRecentCompletionBridge({ entityId, store }))
  const hasRecentCompletion = useSyncExternalStore(
    bridge.subscribe,
    bridge.getSnapshot,
    bridge.getSnapshot
  )
  if (hasActiveAvatar && hasRecentCompletion) bridge.clear()
  return hasActiveAvatar ? false : hasRecentCompletion
}
