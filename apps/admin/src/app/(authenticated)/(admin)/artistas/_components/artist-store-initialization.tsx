'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
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

  return null
}
