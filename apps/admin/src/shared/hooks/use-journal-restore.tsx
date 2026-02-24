'use client'

import { useEffect, useRef, useState, type JSX } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { JournalEntity } from '@/shared/lib/database-entities'
import type { EntityOperationStore } from '@/shared/ui-state/operation-log/types'
import {
  hasEntries,
  getLatestEntries,
  clearSection
} from '@/shared/change-journal/change-journal'
import { journalEntriesToOperations } from '@/shared/lib/journal-entries-to-operations'
import { SectionPendingBanner } from '@/shared/components/section-pending-banner'

interface UseJournalRestoreOptions<T> {
  entity: JournalEntity
  sectionLabel: string
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<T>>>
}

export function useJournalRestore<T>({
  entity,
  sectionLabel,
  operationStore
}: UseJournalRestoreOptions<T>): {
  PendingBanner: (() => JSX.Element | null) | null
} {
  const [showBanner, setShowBanner] = useState(false)
  const isHydrated = useRef(false)

  useEffect(() => {
    async function checkAndHydrate() {
      const hasPending = await hasEntries(entity)

      if (hasPending && !isHydrated.current) {
        // Hydrate immediately so changes are visible in UI before any user action
        const entries = await getLatestEntries(entity)
        const operations = journalEntriesToOperations<T>(entries)
        operationStore.getState().hydratePersistedOperations(operations)
        isHydrated.current = true
      }

      setShowBanner(hasPending)
    }

    checkAndHydrate()
  }, [entity, operationStore])

  const PendingBanner = showBanner
    ? () => (
        <SectionPendingBanner
          sectionLabel={sectionLabel}
          onRestore={async () => {
            // We do not delete the journal on restore, just mark the entries as applied, so we can keep track of what was restored and when
            window.dispatchEvent(new CustomEvent('journal-changed'))
            setShowBanner(false)
          }}
          onDiscard={async () => {
            // Remove the hydrated changes and clear journal
            operationStore.getState().clearPersistedOperations()
            await clearSection(entity)
            window.dispatchEvent(new CustomEvent('journal-changed'))
            setShowBanner(false)
          }}
        />
      )
    : null

  return { PendingBanner }
}
