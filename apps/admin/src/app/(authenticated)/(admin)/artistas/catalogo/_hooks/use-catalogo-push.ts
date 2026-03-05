'use client'

import { useRouter } from 'next/navigation'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { useJournalFlushRegistry } from '@/shared/lib/journal-flush-registry'
import { saveCatalogoAction } from '../_actions/save-catalogo.action'
import { useCatalogOperationStore } from '../_store/catalog-ui-store'
import { catalogoArtistaInsertSchema } from '../_schemas/catalogo.schema'
import { ENTITIES } from '@/shared/lib/database-entities'

export function useCatalogoPush() {
  const router = useRouter()
  const store = useCatalogOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveCatalogoAction,
    section: ENTITIES.CATALOGO_ARTISTA,
    validators: {
      catalogo_artista: catalogoArtistaInsertSchema
    },
    onSuccess: () => {
      store.cleanup()
      router.refresh()
    }
  }

  const { push, isPending, result, progress } = usePush(config)

  const save = async () => {
    // Flush any ops not yet written to journal (e.g. debounce window still open)
    await useJournalFlushRegistry.getState().flush(ENTITIES.CATALOGO_ARTISTA)
    push().catch(() => {})
  }

  return { save, push, isPending, result, progress }
}
