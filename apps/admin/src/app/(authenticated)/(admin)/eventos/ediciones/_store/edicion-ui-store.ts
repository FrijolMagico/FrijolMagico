import { createProjectionStore } from '@/shared/operations/projection'
import { createEntityOperationStore } from '@/shared/operations/log'
import type { EdicionEntry } from '../_types'

export const useEdicionOperationStore =
  createEntityOperationStore<EdicionEntry>()

export const useEdicionProjectionStore = createProjectionStore<EdicionEntry>()
