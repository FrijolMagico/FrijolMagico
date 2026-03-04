import type { EventoEntry } from '../_types'
import { createEntityOperationStore } from '@/shared/operations/log'
import { createProjectionStore } from '@/shared/operations/projection'

export const useEventoOperationStore = createEntityOperationStore<EventoEntry>()
export const useEventoProjectionStore = createProjectionStore<EventoEntry>()
