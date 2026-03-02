'use client'

import { useRef, useEffect } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import { EntityOperationStore } from '../operations/log/types'
import { ProjectionStore } from '../operations/projection'
import { BaseEntity } from '../operations/types'

interface UseProjectionSyncOptions<T> {
  initialData: T[]
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<BaseEntity<T>>>>
  projectionStore: UseBoundStore<StoreApi<ProjectionStore<BaseEntity<T>>>>
}

export function useProjectionSync<T>({
  initialData,
  operationStore,
  projectionStore
}: UseProjectionSyncOptions<BaseEntity<T>>): void {
  const initialDataRef = useRef(initialData)

  // When initialData changes (fresh server data after router.refresh()),
  // re-project with the new data.
  useEffect(() => {
    initialDataRef.current = initialData

    const opState = operationStore.getState()

    console.log(
      '[useProjectionSync] initialData changed, re-projecting with ops:',
      {
        initialData,
        operations: opState.operations
      }
    )

    // Force re-projection with fresh server data + any concurrent ops
    projectionStore.getState().project(initialData, opState.operations)
  }, [initialData, operationStore, projectionStore])

  // Seed on mount + subscribe to operation store changes
  useEffect(() => {
    // Read CURRENT state from operation store instead of null
    const currentOpState = operationStore.getState()
    projectionStore
      .getState()
      .project(initialDataRef.current, currentOpState.operations)

    // Subscribe: re-project whenever operations change.
    // Skip re-projection when the store was just reset after a commit
    // (both ops null but lastCommitAt present) — fresh server data is
    // incoming via router.refresh() and the initialData effect will
    // handle re-projection with the correct data.
    const unsubscribe = operationStore.subscribe((state) => {
      const isPostCommitReset =
        state.operations === null && state.lastCommitAt !== null

      if (isPostCommitReset) return

      projectionStore
        .getState()
        .project(initialDataRef.current, state.operations)
    })

    return unsubscribe
  }, [operationStore, projectionStore])
}
