'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { saveArtistaAction } from '../_actions/save-artista.action'
import { useArtistsOperationStore } from '../_store/artista-ui-store'

export function useArtistaPush() {
  const router = useRouter()
  const store = useArtistsOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveArtistaAction,
    section: 'artista',
    onSuccess: () => {
      store.commitSuccessCleanup()
      router.refresh()
    }
  }

  const { push, isPending, result, progress } = usePush(config)

  const save = async () => {
    await store.commitPendingOperations()
    push().catch(() => {
      toast.error('Error inesperado al guardar')
    })
  }

  return { save, push, isPending, result, progress }
}