import { writeEntry } from '@/shared/change-journal/change-journal'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { Organization } from '../_types'
import {
  createEntityOperationStore,
  EntityOperation
} from '@/shared/ui-state/operation-log'
import { createUIProjectionStore } from '@/shared/ui-state/ui-projection-engine'

// This function is to communicate the changes in entity-store into journal
// It needs an operation that will have the entity-state shape and this function decided how to write the journal entry based on the operation type (ADD, UPDATE, DELETE)
// this function can be abstracted into a generic one if we see the same pattern in other entities, but for now, we can keep it specific for Organization entity
export async function writeOrganizationJournal(
  operations: EntityOperation<Organization>[]
): Promise<void> {
  const section = JOURNAL_ENTITIES.ORGANIZACION

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
          for (const [field, value] of Object.entries(operation.data)) {
            await writeEntry(section, `${section}:${operation.id}:${field}`, {
              op: 'set',
              value
            })
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

export const useOrganizationOperationStore =
  createEntityOperationStore<Organization>({
    commitOperations: writeOrganizationJournal
  })

export const useOrganizationProjectionStore =
  createUIProjectionStore<Organization>()
