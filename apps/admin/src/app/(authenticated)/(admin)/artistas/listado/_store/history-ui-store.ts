import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { createEntityOperationStore } from '@/shared/ui-state/operation-log'
import { writeOperationIntoJournal } from '@/shared/lib/write-operation-into-journal'
import { createProjectionStore } from '@/shared/ui-state/ui-projection-engine'
import type { HistoryEntry } from '../_types'

export const useHistoryOperationStore = createEntityOperationStore<HistoryEntry>({
  commitOperations: async (ops) =>
    writeOperationIntoJournal(ops, JOURNAL_ENTITIES.ARTISTA_HISTORIAL)
})

export const useHistoryProjectionStore = createProjectionStore<HistoryEntry>()
