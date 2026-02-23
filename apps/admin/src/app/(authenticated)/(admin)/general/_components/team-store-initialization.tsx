'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import {
  JOURNAL_ENTITIES,
  JOURNAL_ENTITY_LABELS
} from '@/shared/lib/database-entities'
import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import type { TeamMember } from '../_types'

interface TeamStoreInitializationProps {
  initialData: TeamMember[]
}

export function TeamStoreInitialization({
  initialData
}: TeamStoreInitializationProps) {
  useProjectionSync<TeamMember>({
    initialData,
    operationStore: useTeamOperationStore,
    projectionStore: useTeamProjectionStore
  })

  const { PendingBanner } = useJournalRestore<TeamMember>({
    entity: JOURNAL_ENTITIES.ORGANIZACION_EQUIPO,
    sectionLabel: JOURNAL_ENTITY_LABELS[JOURNAL_ENTITIES.ORGANIZACION_EQUIPO],
    operationStore: useTeamOperationStore
  })

  if (PendingBanner) return <PendingBanner />
  return null
}
