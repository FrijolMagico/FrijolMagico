'use client'

import { useRef, useEffect } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { EntityOperationStore } from '@/shared/ui-state/operation-log/types'
import type { UIProjectionState } from '@/shared/ui-state/ui-projection-engine'

interface UseProjectionSyncOptions<T extends { id: string }> {
  initialData: T[]
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<T>>>
  projectionStore: UseBoundStore<StoreApi<UIProjectionState<T>>>
}

export function useProjectionSync<T extends { id: string }>({
  initialData,
  operationStore,
  projectionStore
}: UseProjectionSyncOptions<T>): void {
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
