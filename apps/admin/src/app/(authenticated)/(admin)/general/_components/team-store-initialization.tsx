'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import {
  JOURNAL_ENTITIES
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

  useDirtySync(useTeamProjectionStore, JOURNAL_ENTITIES.ORGANIZACION_EQUIPO)

  useJournalRestore<TeamMember>({
    entity: JOURNAL_ENTITIES.ORGANIZACION_EQUIPO,
    operationStore: useTeamOperationStore
  })


  return null
}
