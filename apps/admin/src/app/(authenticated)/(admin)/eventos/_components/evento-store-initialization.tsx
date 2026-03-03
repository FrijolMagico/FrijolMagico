'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import { useJournalSync } from '@/shared/hooks/use-journal-sync'
import { ENTITIES } from '@/shared/lib/database-entities'
import { EventoEntry } from '../_types'
import {
  useEventoOperationStore,
  useEventoProjectionStore
} from '../_store/evento-ui-store'

interface EventoStoreInitializationProps {
  initialData: EventoEntry[]
}

export function EventoStoreInitialization({
  initialData
}: EventoStoreInitializationProps) {
  useProjectionSync<EventoEntry>({
    initialData,
    operationStore: useEventoOperationStore,
    projectionStore: useEventoProjectionStore
  })

  useDirtySync(
    useEventoProjectionStore,
    useEventoOperationStore,
    ENTITIES.EVENTO
  )

  useJournalRestore<EventoEntry>({
    entity: ENTITIES.EVENTO,
    operationStore: useEventoOperationStore
  })

  useJournalSync<EventoEntry>({
    entity: ENTITIES.EVENTO,
    operationStore: useEventoOperationStore
  })

  return null
}
