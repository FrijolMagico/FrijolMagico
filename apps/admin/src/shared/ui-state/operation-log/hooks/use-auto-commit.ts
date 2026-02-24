'use client'

import { useEffect, useRef } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { EntityOperationStore } from '../types'

export function useAutoCommit<T>(
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<T>>>,
  debounceMs = 1000
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isComittingRef = useRef(false) // Mutex-like ref to prevent concurrent commits

  useEffect(() => {
    const unsubscribe = operationStore.subscribe((state, prevState) => {
      const prev = prevState.pendingOperations?.length ?? 0
      const curr = state.pendingOperations?.length ?? 0

      if (curr > prev) {
        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(async () => {
          if (isComittingRef.current) return

          try {
            operationStore.getState().commitPendingOperations()
            window.dispatchEvent(new CustomEvent('journal-changed'))
          } finally {
            isComittingRef.current = false
          }
        }, debounceMs)
      }
    })

    return () => {
      unsubscribe()
      if (timerRef.current) clearTimeout(timerRef.current)

      const finalState = operationStore.getState()
      if (finalState.pendingOperations?.length) {
        finalState.commitPendingOperations()
        window.dispatchEvent(new CustomEvent('journal-changed'))
      }
    }
  }, [operationStore, debounceMs])
}
