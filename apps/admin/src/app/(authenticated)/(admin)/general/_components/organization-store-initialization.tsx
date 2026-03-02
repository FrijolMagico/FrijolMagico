'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import { useJournalSync } from '@/shared/hooks/use-journal-sync'
import { ENTITIES } from '@/shared/lib/database-entities'
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
    // Organization is a singular entity; useProjectionSync expects T[], so it's wrapped in an array
    initialData: [initialData],
    operationStore: useOrganizationOperationStore,
    projectionStore: useOrganizationProjectionStore
  })

  useDirtySync(
    useOrganizationProjectionStore,
    useOrganizationOperationStore,
    ENTITIES.ORGANIZACION
  )

  useJournalRestore<Organization>({
    entity: ENTITIES.ORGANIZACION,
    operationStore: useOrganizationOperationStore
  })

  useJournalSync<Organization>({
    entity: ENTITIES.ORGANIZACION,
    operationStore: useOrganizationOperationStore
  })

  return null
}
