'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import {
  JOURNAL_ENTITIES,
  JOURNAL_ENTITY_LABELS
} from '@/shared/lib/database-entities'
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
    initialData: [initialData],
    operationStore: useOrganizationOperationStore,
    projectionStore: useOrganizationProjectionStore
  })

  const { PendingBanner } = useJournalRestore<Organization>({
    entity: JOURNAL_ENTITIES.ORGANIZACION,
    sectionLabel: JOURNAL_ENTITY_LABELS[JOURNAL_ENTITIES.ORGANIZACION],
    operationStore: useOrganizationOperationStore
  })

  if (PendingBanner) return <PendingBanner />
  return null
}
