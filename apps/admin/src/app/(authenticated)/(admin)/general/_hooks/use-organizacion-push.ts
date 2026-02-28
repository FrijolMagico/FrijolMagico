'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { saveOrganizacionAction } from '../_actions/save-organizacion.action'
import { saveOrganizacionEquipoAction } from '../_actions/save-organizacion-equipo.action'
import { useOrganizationOperationStore } from '../_store/organization-ui-store'
import { useTeamOperationStore } from '../_store/organization-team-ui-store'

export function useOrganizacionPush() {
  const router = useRouter()
  const orgStore = useOrganizationOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveOrganizacionAction,
    section: 'organizacion',
    onSuccess: () => {
      orgStore.commitSuccessCleanup()
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

export function useOrganizacionEquipoPush() {
  const router = useRouter()
  const teamStore = useTeamOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveOrganizacionEquipoAction,
    section: 'organizacion_equipo',
    onSuccess: () => {
      teamStore.commitSuccessCleanup()
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