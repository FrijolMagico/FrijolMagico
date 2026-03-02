'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { Entity } from '@/shared/lib/database-entities'
import type { EntityOperationStore } from '@/shared/operations/log/types'
import {
  hasEntries,
  getLatestEntries,
  clearSection
} from '@/shared/operations/journal'
import { journalEntriesToOperations } from '@/shared/lib/journal-entries-to-operations'
import { useDiscardRegistry } from '@/shared/lib/discard-registry'

interface UseJournalRestoreOptions<T> {
  entity: Entity
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
      operationStore.getState().hydrate(operations)
      isHydrated.current = true
    }

    if (!hasPending && isHydrated.current) {
      operationStore.getState().cleanup()
      isHydrated.current = false
    }
  }, [entity, operationStore])

  const discardAll = useCallback(async () => {
    isDiscarding.current = true
    // discardCleanup sets operations=null WITHOUT touching lastCommitAt, so the
    // isPostCommitReset guard in useProjectionSync does NOT fire — allowing
    // project(snapshot, null) to run and force a full rebuild from remote data.
    // cleanup() (which sets lastCommitAt) is reserved for the post-commit flow.
    operationStore.getState().discardCleanup()
    await clearSection(entity)
    isHydrated.current = false
    isDiscarding.current = false
  }, [entity, operationStore])

  useEffect(() => {
    // Register this entity's discard function in the global registry.
    // useRouteChanges.discardAll() calls all registered functions for the current route's entities.
    const { register, unregister } = useDiscardRegistry.getState()
    register(entity, discardAll)

    // Initial check on mount — only moment hydration is needed.
    // discardAll handles cleanup directly (no subscription needed).
    // BroadcastChannel cross-tab sync will call checkAndHydrate() explicitly when added.

    checkAndHydrate()

    return () => {

      unregister(entity)
    }
  }, [entity, checkAndHydrate, discardAll])
}
