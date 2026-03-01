'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { JournalEntity } from '@/shared/lib/database-entities'
import type { EntityOperationStore } from '@/shared/ui-state/operation-log/types'
import {
  hasEntries,
  getLatestEntries,
  clearSection
} from '@/shared/change-journal'
import { journalEntriesToOperations } from '@/shared/lib/journal-entries-to-operations'
import { useDiscardRegistry } from '@/shared/lib/discard-registry'

interface UseJournalRestoreOptions<T> {
  entity: JournalEntity
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<T>>>
}

export function useJournalRestore<T>({
  entity,
  operationStore
}: UseJournalRestoreOptions<T>): void {
  const isHydrated = useRef(false)
  const isDiscarding = useRef(false)

  const checkAndHydrate = useCallback(async () => {
    if (isDiscarding.current) return

    const hasPending = await hasEntries(entity)

    if (hasPending && !isHydrated.current) {
      // Hydrate immediately so changes are visible in UI before any user action
      const entries = await getLatestEntries(entity)
      const operations = journalEntriesToOperations<T>(entries)
      operationStore.getState().hydratePersistedOperations(operations)
      isHydrated.current = true
    }

    if (!hasPending && isHydrated.current) {
      operationStore.getState().clearPersistedOperations()
      isHydrated.current = false
    }
  }, [entity, operationStore])

  const discardAll = useCallback(async () => {
    isDiscarding.current = true
    // IndexedDB first: prevents data resurrection via Zustand subscription
    await clearSection(entity)
    // Then Zustand: resetStore clears both persistedOperations and pendingOperations atomically,
    // preventing useAutoCommit cleanup from re-writing pending ops on unmount.
    operationStore.getState().resetStore()
    isHydrated.current = false
    isDiscarding.current = false
  }, [entity, operationStore])

  useEffect(() => {
    // Register this entity's discard function in the global registry.
    // useRouteChanges.discardAll() calls all registered functions for the current route's entities.
    const { register, unregister } = useDiscardRegistry.getState()
    register(entity, discardAll)

    // Initial check on mount
    checkAndHydrate()

    // Subscribe to operation store — fires when persistedOperations reference changes.
    // Covers: commitPendingOperations(), hydratePersistedOperations(), resetStore() calls.
    // NOTE: checkAndHydrate is async; isHydrated.current is set synchronously before the
    // potential second subscription callback resolves. Safe against double-hydration.
    const unsubscribe = operationStore.subscribe((state, prevState) => {
      if (state.persistedOperations !== prevState.persistedOperations) {
        checkAndHydrate()
      }
    })

    return () => {
      unregister(entity)
      unsubscribe()
    }
  }, [operationStore, entity, checkAndHydrate, discardAll])

  return
}
