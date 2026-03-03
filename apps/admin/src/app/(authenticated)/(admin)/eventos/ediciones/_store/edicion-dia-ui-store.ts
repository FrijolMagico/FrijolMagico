import { createProjectionStore } from '@/shared/operations/projection'
import { createEntityOperationStore } from '@/shared/operations/log'
import type { EdicionDiaEntry } from '../_types'

export const useEdicionDiaOperationStore =
  createEntityOperationStore<EdicionDiaEntry>()

export const useEdicionDiaProjectionStore =
  createProjectionStore<EdicionDiaEntry>()
