'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import { useJournalSync } from '@/shared/hooks/use-journal-sync'
import { ENTITIES } from '@/shared/lib/database-entities'
import { ArtistEntry } from '../_types'
import {
  useArtistsOperationStore,
  useArtistsProjectionStore
} from '../_store/artista-ui-store'

interface ArtistStoreInitializationProps {
  initialData: ArtistEntry[]
}

export function ArtistStoreInitialization({
  initialData
}: ArtistStoreInitializationProps) {
  useProjectionSync<ArtistEntry>({
    initialData,
    operationStore: useArtistsOperationStore,
    projectionStore: useArtistsProjectionStore
  })

  useDirtySync(useArtistsProjectionStore, useArtistsOperationStore, ENTITIES.ARTISTA)

  useJournalRestore<ArtistEntry>({
    entity: ENTITIES.ARTISTA,
    operationStore: useArtistsOperationStore
  })

  useJournalSync<ArtistEntry>({
    entity: ENTITIES.ARTISTA,
    operationStore: useArtistsOperationStore
  })

  return null
}
