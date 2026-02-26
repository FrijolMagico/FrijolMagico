'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import {
  useOrganizationOperationStore,
  useOrganizationProjectionStore
} from '../_store/organization-ui-store'
import type { Organization } from '../_types'

interface OrganizationStoreInitializationProps {
  initialData: Organization
}

export function OrganizationStoreInitialization({
  initialData
}: OrganizationStoreInitializationProps) {
  useProjectionSync<Organization>({
    // Organization es una entidad singular; useProjectionSync espera T[], por eso se envuelve en array
    initialData: [initialData],
    operationStore: useOrganizationOperationStore,
    projectionStore: useOrganizationProjectionStore
  })

  useDirtySync(useOrganizationProjectionStore, JOURNAL_ENTITIES.ORGANIZACION)

  useJournalRestore<Organization>({
    entity: JOURNAL_ENTITIES.ORGANIZACION,
    operationStore: useOrganizationOperationStore
  })

  return null
}
