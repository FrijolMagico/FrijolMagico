'use client'

import { useEffect } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import { useSectionDirtyStore } from '@/shared/lib/section-dirty-store'
import type { Entity } from '@/shared/lib/database-entities'
import type { ProjectionStore } from '../operations/projection'
import type { EntityOperationStore } from '../operations/log/types'

/**
 * Syncs dirty state for a section to the global useSectionDirtyStore.
 *
 * Two subscription channels:
 *
 * 1. projectionStore → net-zero detection.
 *    Evaluates __meta flags after each projection tick. Handles the case where a
 *    user edits a field and then reverts it (net-zero: operations exist but
 *    projection reconciles them away → dirty=false).
 *
 * 2. operationStore → immediate cleanup signal.
 *    When cleanup() is called (post-push or post-discard), operations become null
 *    and lastCommitAt is set. This fires setDirty(false) synchronously — still
 *    inside the React transition — so isDirty is false by the time isPending
 *    becomes false. Prevents the flash where the save bar briefly reverts to its
 *    non-loading state while the projection re-projects after router.refresh().
 *
 * Do not use for read-only entities (e.g. ARTISTA_HISTORIAL).
 */
export function useDirtySync<T extends { id: string }, O>(
  projectionStore: UseBoundStore<StoreApi<ProjectionStore<T>>>,
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<O>>>,
  entity: Entity
): void {
  useEffect(() => {
    // Channel 1: projection-based — handles net-zero edits accurately
    const unsubProjection = projectionStore.subscribe((state) => {
      const hasChanges = Object.values(state.byId).some(
        (e) => e.__meta?.isNew || e.__meta?.isUpdated || e.__meta?.isDeleted
      )
      useSectionDirtyStore.getState().setDirty(entity, hasChanges)
    })

    // Channel 2: operation-based — immediate dirty=false on cleanup()
    // cleanup() sets operations=null + lastCommitAt=now (post-commit or discard).
    // Firing setDirty(false) here means isDirty clears before isPending ends,
    // preventing the save bar from flashing back to its idle state.
    const unsubOperations = operationStore.subscribe((state) => {
      const isPostCommitReset =
        state.operations === null && state.lastCommitAt !== null
      if (isPostCommitReset) {
        useSectionDirtyStore.getState().setDirty(entity, false)
      }
    })

    return () => {
      unsubProjection()
      unsubOperations()
    }
  }, [projectionStore, operationStore, entity])
}
