'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import {
  JOURNAL_ENTITIES
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

  useJournalRestore<HistoryEntry>({
    entity: JOURNAL_ENTITIES.ARTISTA_HISTORIAL,
    sectionLabel: '',
    operationStore: useHistoryOperationStore
  })


  return null
}
