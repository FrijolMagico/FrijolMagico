import { writeEntry } from '@/shared/change-journal/change-journal'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { TeamMember } from '../_types'
import {
  createEntityOperationStore,
  EntityOperation
} from '@/shared/ui-state/operation-log'
import { createUIProjectionStore } from '@/shared/ui-state/ui-projection-engine'

export async function writeTeamJournal(
  operations: EntityOperation<TeamMember>[]
): Promise<void> {
  const section = JOURNAL_ENTITIES.ORGANIZACION_EQUIPO

  for (const operation of operations) {
    switch (operation.type) {
      case 'ADD':
        await writeEntry(section, `${section}:${operation.data.id}`, {
          op: 'set',
          value: operation
        })
        break

      case 'UPDATE':
        if (operation.data) {
          for (const [field, value] of Object.entries(operation.id)) {
            await writeEntry(
              section,
              `${section}:${operation.data.id}:${field}`,
              {
                op: 'set',
                value
              }
            )
          }
        }
        break

      case 'DELETE':
        await writeEntry(section, `${section}:${operation.id}`, {
          op: 'unset'
        })
        break
    }
  }
}

export const useTeamOperationStore = createEntityOperationStore<TeamMember>({
  commitOperations: writeTeamJournal
})

export const useTeamProjectionStore = createUIProjectionStore<TeamMember>()
