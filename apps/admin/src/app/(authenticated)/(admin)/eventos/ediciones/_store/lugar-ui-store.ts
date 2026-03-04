import { createProjectionStore } from '@/shared/operations/projection'
import { createEntityOperationStore } from '@/shared/operations/log'
import type { LugarEntry } from '../_types'

export const useLugarOperationStore = createEntityOperationStore<LugarEntry>()

export const useLugarProjectionStore = createProjectionStore<LugarEntry>()
