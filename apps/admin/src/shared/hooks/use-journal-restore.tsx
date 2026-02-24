'use client'

import { useEffect, useRef, useState, useCallback, useTransition } from 'react'
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
  sectionLabel: string
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
  sectionLabel: _sectionLabel, // eslint-disable-line @typescript-eslint/no-unused-vars
  operationStore
}: UseJournalRestoreOptions<T>): UseJournalRestoreResult {
  const [hasRestoredEntries, setHasRestoredEntries] = useState(false)
  const [noticeVisible, setNoticeVisible] = useState(false)
  const isHydrated = useRef(false)
  const [, startTransition] = useTransition()

  const checkAndHydrate = useCallback(async () => {
    const hasPending = await hasEntries(entity)

    startTransition(() => {
      if (hasPending && !isHydrated.current) {
        // Hydrate immediately so changes are visible in UI before any user action
        getLatestEntries(entity).then(entries => {
          const operations = journalEntriesToOperations<T>(entries)
          operationStore.getState().hydratePersistedOperations(operations)
          isHydrated.current = true
          setNoticeVisible(true)
        })
      }

      if (!hasPending && isHydrated.current) {
        operationStore.getState().clearPersistedOperations()
        isHydrated.current = false
      }

      setHasRestoredEntries(hasPending)
    })
  }, [entity, operationStore, startTransition])

  useEffect(() => {
    void checkAndHydrate()
    window.addEventListener('journal-changed', checkAndHydrate)
    return () => window.removeEventListener('journal-changed', checkAndHydrate)
  }, [checkAndHydrate])
  const dismissNotice = useCallback(() => {
    setNoticeVisible(false)
  }, [])

  const discardAll = useCallback(async () => {
    operationStore.getState().clearPersistedOperations()
    await clearSection(entity)
    window.dispatchEvent(new CustomEvent('journal-changed'))
    setHasRestoredEntries(false)
    setNoticeVisible(false)
    isHydrated.current = false
  }, [entity, operationStore])

  return { hasRestoredEntries, noticeVisible, dismissNotice, discardAll }
}
