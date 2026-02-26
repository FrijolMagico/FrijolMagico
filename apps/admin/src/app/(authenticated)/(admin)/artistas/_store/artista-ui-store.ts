import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { createEntityOperationStore } from '@/shared/ui-state/operation-log'
import { createProjectionStore } from '@/shared/ui-state/ui-projection-engine'
import { ArtistEntry } from '../_types'
import { writeOperationIntoJournal } from '@/shared/lib/write-operation-into-journal'

export const useArtistsOperationStore = createEntityOperationStore<ArtistEntry>({
  commitOperations: async (ops) =>
    writeOperationIntoJournal(ops, JOURNAL_ENTITIES.ARTISTA)
})

export const useArtistsProjectionStore =
  createProjectionStore<ArtistEntry>()
