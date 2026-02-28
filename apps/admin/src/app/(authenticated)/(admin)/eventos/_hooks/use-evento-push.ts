'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { saveEventoAction } from '../_actions/save-evento.action'

export function useEventoPush() {
  const router = useRouter()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveEventoAction,
    section: 'evento',
    onSuccess: () => {
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