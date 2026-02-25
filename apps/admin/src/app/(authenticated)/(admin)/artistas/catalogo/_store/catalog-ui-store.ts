import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { createEntityOperationStore } from '@/shared/ui-state/operation-log'
import { writeOperationIntoJournal } from '@/shared/lib/write-operation-into-journal'
import { createUIProjectionStore } from '@/shared/ui-state/ui-projection-engine'
import { CatalogEntry } from '../_types'

export const useCatalogOperationStore =
  createEntityOperationStore<CatalogEntry>({
    commitOperations: async (ops) =>
      writeOperationIntoJournal(ops, JOURNAL_ENTITIES.CATALOGO_ARTISTA)
  })

export const useCatalogProjectionStore = createUIProjectionStore<CatalogEntry>('catalogo_artista')
