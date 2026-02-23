'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import {
  JOURNAL_ENTITIES,
  JOURNAL_ENTITY_LABELS
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

  const { PendingBanner } = useJournalRestore<CatalogEntry>({
    entity: JOURNAL_ENTITIES.CATALOGO_ARTISTA,
    sectionLabel: JOURNAL_ENTITY_LABELS[JOURNAL_ENTITIES.CATALOGO_ARTISTA],
    operationStore: useCatalogOperationStore
  })

  if (PendingBanner) return <PendingBanner />
  return null
}
