import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import type { EntityOperation } from '@/shared/ui-state/entity-state'
import { writeEntry } from '@/shared/change-journal/change-journal'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { Organization } from '../_types'

// This function is to communicate the changes in entity-store into journal
// It needs an operation that will have the entity-state shape and this function decided how to write the journal entry based on the operation type (ADD, UPDATE, DELETE)
// this function can be abstracted into a generic one if we see the same pattern in other entities, but for now, we can keep it specific for Organization entity
export async function writeOrganizationJournal(
  operation: EntityOperation<Organization>
): Promise<void> {
  const section = JOURNAL_ENTITIES.ORGANIZACION

  switch (operation.type) {
    case 'ADD':
      await writeEntry(section, `${section}:${operation.entityId}`, {
        op: 'set',
        value: operation.entity
      })
      break

    case 'UPDATE':
      if (operation.data) {
        for (const [field, value] of Object.entries(operation.data)) {
          await writeEntry(
            section,
            `${section}:${operation.entityId}:${field}`,
            {
              op: 'set',
              value
            }
          )
        }
      }
      break

    case 'DELETE':
      await writeEntry(section, `${section}:${operation.entityId}`, {
        op: 'unset'
      })
      break
  }
}

export const useOrganizationUIStore = createEntityUIStateStore<Organization>()
