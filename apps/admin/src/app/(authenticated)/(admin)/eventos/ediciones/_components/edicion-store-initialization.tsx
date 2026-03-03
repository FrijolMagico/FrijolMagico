'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useJournalRestore } from '@/shared/hooks/use-journal-restore'
import { useJournalSync } from '@/shared/hooks/use-journal-sync'
import { ENTITIES } from '@/shared/lib/database-entities'
import {
  useEdicionOperationStore,
  useEdicionProjectionStore
} from '../_store/edicion-ui-store'
import {
  useEdicionDiaOperationStore,
  useEdicionDiaProjectionStore
} from '../_store/edicion-dia-ui-store'
import {
  useLugarOperationStore,
  useLugarProjectionStore
} from '../_store/lugar-ui-store'
import type { EdicionEntry, EdicionDiaEntry, LugarEntry } from '../_types'

interface EdicionStoreInitializationProps {
  ediciones: EdicionEntry[]
  dias: EdicionDiaEntry[]
  lugares: LugarEntry[]
}

export function EdicionStoreInitialization({
  ediciones,
  dias,
  lugares
}: EdicionStoreInitializationProps) {
  // Entity 1: Edicion
  useProjectionSync<EdicionEntry>({
    initialData: ediciones,
    operationStore: useEdicionOperationStore,
    projectionStore: useEdicionProjectionStore
  })

  useDirtySync(
    useEdicionProjectionStore,
    useEdicionOperationStore,
    ENTITIES.EVENTO_EDICION
  )

  useJournalRestore<EdicionEntry>({
    entity: ENTITIES.EVENTO_EDICION,
    operationStore: useEdicionOperationStore
  })

  useJournalSync<EdicionEntry>({
    entity: ENTITIES.EVENTO_EDICION,
    operationStore: useEdicionOperationStore
  })

  // Entity 2: EdicionDia
  useProjectionSync<EdicionDiaEntry>({
    initialData: dias,
    operationStore: useEdicionDiaOperationStore,
    projectionStore: useEdicionDiaProjectionStore
  })

  useDirtySync(
    useEdicionDiaProjectionStore,
    useEdicionDiaOperationStore,
    ENTITIES.EVENTO_EDICION_DIA
  )

  useJournalRestore<EdicionDiaEntry>({
    entity: ENTITIES.EVENTO_EDICION_DIA,
    operationStore: useEdicionDiaOperationStore
  })

  useJournalSync<EdicionDiaEntry>({
    entity: ENTITIES.EVENTO_EDICION_DIA,
    operationStore: useEdicionDiaOperationStore
  })

  // Entity 3: Lugar
  useProjectionSync<LugarEntry>({
    initialData: lugares,
    operationStore: useLugarOperationStore,
    projectionStore: useLugarProjectionStore
  })

  useDirtySync(useLugarProjectionStore, useLugarOperationStore, ENTITIES.LUGAR)

  useJournalRestore<LugarEntry>({
    entity: ENTITIES.LUGAR,
    operationStore: useLugarOperationStore
  })

  useJournalSync<LugarEntry>({
    entity: ENTITIES.LUGAR,
    operationStore: useLugarOperationStore
  })

  return null
}
