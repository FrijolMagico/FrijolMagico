'use client'

import { useEffect, useRef } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { EntityOperationStore } from '../types'

export function useAutoCommit<T>(
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<T>>>,
  debounceMs = 1000
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const unsubscribe = operationStore.subscribe((state, prevState) => {
      const prev = prevState.pendingOperations?.length ?? 0
      const curr = state.pendingOperations?.length ?? 0

      if (curr > prev) {
        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(() => {
          operationStore.getState().commitPendingOperations()
        }, debounceMs)
      }
    })

    return () => {
      unsubscribe()
      if (timerRef.current) clearTimeout(timerRef.current)

      const finalState = operationStore.getState()
      if (finalState.pendingOperations?.length) {
        finalState.commitPendingOperations()
      }
    }
  }, [operationStore, debounceMs])
}
