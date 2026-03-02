import { ArtistEntry } from '../_types'
import { createEntityOperationStore } from '@/shared/operations/log'
import { createProjectionStore } from '@/shared/operations/projection'

export const useArtistsOperationStore =
  createEntityOperationStore<ArtistEntry>()

export const useArtistsProjectionStore = createProjectionStore<ArtistEntry>()
