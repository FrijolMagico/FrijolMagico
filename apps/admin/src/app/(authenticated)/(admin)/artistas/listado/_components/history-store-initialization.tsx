'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import {
  JOURNAL_ENTITIES,
  JOURNAL_ENTITY_LABELS
} from '@/shared/lib/database-entities'
import {
  useHistoryOperationStore,
  useHistoryProjectionStore
} from '../_store/history-ui-store'
import type { HistoryEntry } from '../_types'

export function HistoryStoreInitialization({
  initialData
}: {
  initialData: HistoryEntry[]
}) {
  useProjectionSync<HistoryEntry>({
    initialData,
    operationStore: useHistoryOperationStore,
    projectionStore: useHistoryProjectionStore
  })

  const { PendingBanner } = useJournalRestore<HistoryEntry>({
    entity: JOURNAL_ENTITIES.ARTISTA_HISTORIAL,
    sectionLabel: JOURNAL_ENTITY_LABELS[JOURNAL_ENTITIES.ARTISTA_HISTORIAL],
    operationStore: useHistoryOperationStore
  })

  if (PendingBanner) return <PendingBanner />
  return null
}
