'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import {
  JOURNAL_ENTITIES
} from '@/shared/lib/database-entities'
import {
  useCatalogOperationStore,
  useCatalogProjectionStore
} from '../_store/catalog-ui-store'
import type { CatalogEntry } from '../_types'

interface CatalogStoreInitializationProps {
  initialData: CatalogEntry[]
}

export function CatalogStoreInitialization({
  initialData
}: CatalogStoreInitializationProps) {
  useProjectionSync<CatalogEntry>({
    initialData,
    operationStore: useCatalogOperationStore,
    projectionStore: useCatalogProjectionStore
  })

  useDirtySync(useCatalogProjectionStore, JOURNAL_ENTITIES.CATALOGO_ARTISTA)

  useJournalRestore<CatalogEntry>({
    entity: JOURNAL_ENTITIES.CATALOGO_ARTISTA,
    operationStore: useCatalogOperationStore
  })


  return null
}
