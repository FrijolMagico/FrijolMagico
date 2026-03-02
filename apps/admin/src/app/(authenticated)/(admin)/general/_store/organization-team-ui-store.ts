import type { TeamMember } from '../_types'
import { createEntityOperationStore } from '@/shared/operations/log'
import { createProjectionStore } from '@/shared/operations/projection'

export const useTeamOperationStore = createEntityOperationStore<TeamMember>()
export const useTeamProjectionStore = createProjectionStore<TeamMember>()
