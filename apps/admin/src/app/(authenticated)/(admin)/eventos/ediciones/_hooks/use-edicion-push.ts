'use client'

import { useRouter } from 'next/navigation'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { useJournalFlushRegistry } from '@/shared/lib/journal-flush-registry'
import { saveEdicionAction } from '../_actions/save-edicion.action'
import { useEdicionOperationStore } from '../_store/edicion-ui-store'
import { useEdicionDiaOperationStore } from '../_store/edicion-dia-ui-store'
import { useLugarOperationStore } from '../_store/lugar-ui-store'
import {
  edicionSchema,
  edicionDiaSchema,
  lugarSchema
} from '../_schemas/edicion.schema'
import { ENTITIES } from '@/shared/lib/database-entities'

export function useEdicionPush() {
  const router = useRouter()
  const edicionStore = useEdicionOperationStore()
  const edicionDiaStore = useEdicionDiaOperationStore()
  const lugarStore = useLugarOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveEdicionAction,
    section: [
      ENTITIES.EVENTO_EDICION,
      ENTITIES.EVENTO_EDICION_DIA,
      ENTITIES.LUGAR
    ],
    validators: {
      evento_edicion: edicionSchema,
      evento_edicion_dia: edicionDiaSchema,
      lugar: lugarSchema
    },
    onSuccess: () => {
      edicionStore.cleanup()
      edicionDiaStore.cleanup()
      lugarStore.cleanup()
      router.refresh()
    }
  }

  const { push, isPending, result, progress } = usePush(config)

  const save = async () => {
    // Flush ALL 3 entity journals before push
    const flush = useJournalFlushRegistry.getState().flush
    await flush(ENTITIES.EVENTO_EDICION)
    await flush(ENTITIES.EVENTO_EDICION_DIA)
    await flush(ENTITIES.LUGAR)

    push().catch(() => {})
  }

  return { save, push, isPending, result, progress }
}
