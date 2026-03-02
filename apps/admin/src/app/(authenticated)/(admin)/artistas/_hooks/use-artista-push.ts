'use client'

import { useRouter } from 'next/navigation'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { useJournalFlushRegistry } from '@/shared/lib/journal-flush-registry'
import { saveArtistaAction } from '../_actions/save-artista.action'
import { useArtistsOperationStore } from '../_store/artista-ui-store'
import { artistaImagenSchema, artistaSchema } from '../_schemas/artista.schema'
import { ENTITIES } from '@/shared/lib/database-entities'

export function useArtistaPush() {
  const router = useRouter()
  const store = useArtistsOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveArtistaAction,
    section: ENTITIES.ARTISTA,
    validators: {
      artista: artistaSchema,
      artistaImagen: artistaImagenSchema
    },
    onSuccess: () => {
      store.cleanup()
      router.refresh()
    }
  }

  const { push, isPending, result, progress } = usePush(config)

  const save = async () => {
    // Flush any ops not yet written to journal (e.g. debounce window still open)
    await useJournalFlushRegistry.getState().flush(ENTITIES.ARTISTA)
    push().catch(() => {})
  }

  return { save, push, isPending, result, progress }
}
