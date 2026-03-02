'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import { useJournalSync } from '@/shared/hooks/use-journal-sync'
import { ENTITIES } from '@/shared/lib/database-entities'
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

  useDirtySync(
    useTeamProjectionStore,
    useTeamOperationStore,
    ENTITIES.ORGANIZACION_EQUIPO
  )

  useJournalRestore<TeamMember>({
    entity: ENTITIES.ORGANIZACION_EQUIPO,
    operationStore: useTeamOperationStore
  })

  useJournalSync<TeamMember>({
    entity: ENTITIES.ORGANIZACION_EQUIPO,
    operationStore: useTeamOperationStore
  })

  return null
}
