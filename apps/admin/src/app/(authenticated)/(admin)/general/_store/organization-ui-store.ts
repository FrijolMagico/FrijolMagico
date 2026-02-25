import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { createEntityOperationStore } from '@/shared/ui-state/operation-log'
import { createUIProjectionStore } from '@/shared/ui-state/ui-projection-engine'
import { writeOperationIntoJournal } from '@/shared/lib/write-operation-into-journal'
import type { Organization } from '../_types'

export const useOrganizationOperationStore =
  createEntityOperationStore<Organization>({
    commitOperations: (ops) =>
      writeOperationIntoJournal(ops, JOURNAL_ENTITIES.ORGANIZACION)
  })

export const useOrganizationProjectionStore =
  createUIProjectionStore<Organization>('organizacion')
