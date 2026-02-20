'use client'

import { useRef, useEffect } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type {
  BaseEntity,
  EntityOperationStore
} from '@/shared/ui-state/operation-log/types'
import type { UIProjectionState } from '@/shared/ui-state/ui-projection-engine'

interface UseProjectionSyncOptions<T> {
  initialData: T[]
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<BaseEntity<T>>>>
  projectionStore: UseBoundStore<StoreApi<UIProjectionState<BaseEntity<T>>>>
}

export function useProjectionSync<T>({
  initialData,
  operationStore,
  projectionStore
}: UseProjectionSyncOptions<BaseEntity<T>>): void {
  const initialDataRef = useRef(initialData)

  // Keep ref in sync with latest initialData prop
  useEffect(() => {
    initialDataRef.current = initialData
  }, [initialData])

  // Seed on mount + subscribe to operation store changes
  useEffect(() => {
    // Seed: ensure projection store has data on mount
    projectionStore.getState().project(initialDataRef.current, null, null)

    // Subscribe: re-project whenever operations change
    const unsubscribe = operationStore.subscribe((state) => {
      projectionStore
        .getState()
        .project(
          initialDataRef.current,
          state.persistedOperations,
          state.pendingOperations
        )
    })

    return unsubscribe
  }, [operationStore, projectionStore])
}
