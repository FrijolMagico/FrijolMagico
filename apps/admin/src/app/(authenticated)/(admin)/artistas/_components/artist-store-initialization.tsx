'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import {
  JOURNAL_ENTITIES
} from '@/shared/lib/database-entities'
import { ArtistEntry } from '../_types'
import {
  useArtistsOperationStore,
  useArtistsProjectionStore
} from '../_store/artista-ui-store'

interface InitializeArtistStoreOptions {
  initialData: ArtistEntry[]
}

export function ArtistStoreInitialization({
  initialData
}: InitializeArtistStoreOptions) {
  useProjectionSync<ArtistEntry>({
    initialData,
    operationStore: useArtistsOperationStore,
    projectionStore: useArtistsProjectionStore
  })

  useJournalRestore<ArtistEntry>({
    entity: JOURNAL_ENTITIES.ARTISTA,
    sectionLabel: '',
    operationStore: useArtistsOperationStore
  })


  return null
}
