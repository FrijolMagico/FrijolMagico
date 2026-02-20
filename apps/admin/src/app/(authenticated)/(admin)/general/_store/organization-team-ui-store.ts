import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { TeamMember } from '../_types'
import { createEntityOperationStore } from '@/shared/ui-state/operation-log'
import { createUIProjectionStore } from '@/shared/ui-state/ui-projection-engine'
import { writeOperationIntoJournal } from '@/shared/lib/write-operation-into-journal'

export const useTeamOperationStore = createEntityOperationStore<TeamMember>({
  commitOperations: (ops) =>
    writeOperationIntoJournal(ops, JOURNAL_ENTITIES.ORGANIZACION_EQUIPO)
})

export const useTeamProjectionStore = createUIProjectionStore<TeamMember>()
