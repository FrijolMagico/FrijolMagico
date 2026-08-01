'use client'

import { useEffect } from 'react'

import type { AssetQueueJob, AssetQueueSnapshot } from '@/shared/assets-manager/client/queue'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'
import { ASSET_TARGET } from '@/shared/assets-manager/client/contracts'
import type { SharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import { getSharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import { updateCatalogFieldAction } from '@/core/artistas/catalogo/_actions/update-catalog-field.action'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface AvatarCancelObserverOptions {
  /** Defaults to the global shared store. Inject a mock for tests. */
  store?: SharedAssetQueueStore
  /**
   * Override the default server-action call. Intended for tests.
   * Receives the numeric catalog-artist id parsed from the queue job's
   * entityId.
   */
  onCancel?: (artistCatalogId: number) => void
}

// ---------------------------------------------------------------------------
// Default handler
// ---------------------------------------------------------------------------

function defaultOnCancel(artistCatalogId: number): void {
  void updateCatalogFieldAction(artistCatalogId, { activo: false })
}

// ---------------------------------------------------------------------------
// Factory (non-React — for unit tests)
// ---------------------------------------------------------------------------

export interface AvatarCancelObserver {
  /** Tear down the store subscription. */
  destroy: () => void
}

export function createAvatarCancelObserver(
  options: AvatarCancelObserverOptions = {},
): AvatarCancelObserver {
  const store = options.store ?? getSharedAssetQueueStore()
  const handleCancel = options.onCancel ?? defaultOnCancel

  let previousJobs: readonly AssetQueueJob[] = store.getState().jobs

  const unsubscribe = store.subscribe((state: AssetQueueSnapshot) => {
    // Diff current jobs against previous to find newly-CANCELLED jobs
    for (const job of state.jobs) {
      if (job.status !== ASSET_QUEUE_STATUS.CANCELLED) continue

      const wasAlreadyCancelled = previousJobs.some(
        (prev) => prev.jobId === job.jobId && prev.status === ASSET_QUEUE_STATUS.CANCELLED,
      )
      if (wasAlreadyCancelled) continue

      // Only react to artist-avatar cancellations
      if (job.target === ASSET_TARGET.ARTIST_AVATAR) {
        handleCancel(Number(job.entityId))
      }
    }

    previousJobs = state.jobs
  })

  return { destroy: unsubscribe }
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export function useAvatarCancelObserver(): void {
  useEffect(() => {
    const observer = createAvatarCancelObserver()
    return () => observer.destroy()
  }, [])
}
