'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { JournalEntity } from '@/shared/lib/database-entities'
import type { EntityOperationStore } from '@/shared/ui-state/operation-log/types'
import {
  hasEntries,
  getLatestEntries,
  clearSection
} from '@/shared/change-journal/change-journal'
import { journalEntriesToOperations } from '@/shared/lib/journal-entries-to-operations'

interface UseJournalRestoreOptions<T> {
  entity: JournalEntity
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<T>>>
}

interface UseJournalRestoreResult {
  hasRestoredEntries: boolean
  noticeVisible: boolean
  dismissNotice: () => void
  discardAll: () => Promise<void>
}

export function useJournalRestore<T>({
  entity,
  operationStore
}: UseJournalRestoreOptions<T>): UseJournalRestoreResult {
  const [hasRestoredEntries, setHasRestoredEntries] = useState(false)
  const [noticeVisible, setNoticeVisible] = useState(false)
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
      setNoticeVisible(true)
    }

    if (!hasPending && isHydrated.current) {
      operationStore.getState().clearPersistedOperations()
      isHydrated.current = false
    }

    setHasRestoredEntries(hasPending)
  }, [entity, operationStore])

  useEffect(() => {
    // Initial check on mount
    checkAndHydrate()

    // Subscribe to operation store — fires when persistedOperations reference changes.
    // This covers: commitPendingOperations() completing, hydratePersistedOperations(),
    // and clearPersistedOperations() calls.
    // NOTE: checkAndHydrate is async; isHydrated.current is set synchronously before the
    // potential second subscription callback resolves. Safe against double-hydration.
    const unsubscribe = operationStore.subscribe((state, prevState) => {
      if (state.persistedOperations !== prevState.persistedOperations) {
        checkAndHydrate()
      }
    })

    // DOM event listener: REQUIRED for useRouteChanges.discardAll() to work.
    // useRouteChanges operates at route level and calls journalCommitSource.clear()
    // which only clears IndexedDB (not Zustand store). The event notifies us to re-check
    // IndexedDB and clear our Zustand store.
    // See T4: docs/journal-issues/p3-dualidad-journal-restore-route-changes.md
    window.addEventListener('journal-changed', checkAndHydrate)

    return () => {
      unsubscribe()
      window.removeEventListener('journal-changed', checkAndHydrate)
    }
  }, [operationStore, checkAndHydrate])

  const dismissNotice = useCallback(() => {
    setNoticeVisible(false)
  }, [])

  const discardAll = useCallback(async () => {
    isDiscarding.current = true
    operationStore.getState().clearPersistedOperations()
    await clearSection(entity)
    setHasRestoredEntries(false)
    setNoticeVisible(false)
    isHydrated.current = false
    isDiscarding.current = false
    // No dispatch needed here — clearPersistedOperations() triggers the Zustand subscription,
    // but isDiscarding guard prevents checkAndHydrate from running during cleanup.
  }, [entity, operationStore])

  return { hasRestoredEntries, noticeVisible, dismissNotice, discardAll }
}
