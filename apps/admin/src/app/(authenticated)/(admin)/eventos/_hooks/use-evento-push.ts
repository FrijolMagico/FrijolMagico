'use client'

import { useRouter } from 'next/navigation'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { useJournalFlushRegistry } from '@/shared/lib/journal-flush-registry'
import { saveEventoAction } from '../_actions/save-evento.action'
import { useEventoOperationStore } from '../_store/evento-ui-store'
import { eventoSchema } from '../_schemas/evento.schema'
import { ENTITIES } from '@/shared/lib/database-entities'

export function useEventoPush() {
  const router = useRouter()
  const store = useEventoOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveEventoAction,
    section: ENTITIES.EVENTO,
    validators: {
      evento: eventoSchema
    },
    onSuccess: () => {
      store.cleanup()
      router.refresh()
    }
  }

  const { push, isPending, result, progress } = usePush(config)

  const save = async () => {
    // Flush any ops not yet written to journal (e.g. debounce window still open)
    await useJournalFlushRegistry.getState().flush(ENTITIES.EVENTO)
    push().catch(() => {})
  }

  return { save, push, isPending, result, progress }
}
