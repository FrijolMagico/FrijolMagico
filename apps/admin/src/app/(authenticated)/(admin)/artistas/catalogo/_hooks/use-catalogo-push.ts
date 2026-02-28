'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { saveCatalogoAction } from '../_actions/save-catalogo.action'
import { useCatalogOperationStore } from '../_store/catalog-ui-store'

export function useCatalogoPush() {
  const router = useRouter()
  const store = useCatalogOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveCatalogoAction,
    section: 'catalogo_artista',
    onSuccess: () => {
      store.commitSuccessCleanup()
      router.refresh()
      toast.success('Guardado correctamente')
    }
  }

  const { push, isPending, result, progress } = usePush(config)

  const save = () => {
    push().catch(() => {
      toast.error('Error inesperado al guardar')
    })
  }

  return { save, push, isPending, result, progress }
}