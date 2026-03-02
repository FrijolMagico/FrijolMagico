'use client'

import { useRouter } from 'next/navigation'
import { usePush } from '@/shared/push/hooks/use-push'
import type { PushConfig } from '@/shared/push/lib/types'
import { journalPushSource } from '@/shared/lib/journal-push-source'
import { useJournalFlushRegistry } from '@/shared/lib/journal-flush-registry'
import { saveOrganizacionAction } from '../_actions/save-organizacion.action'
import { saveOrganizacionEquipoAction } from '../_actions/save-organizacion-equipo.action'
import { useOrganizationOperationStore } from '../_store/organization-ui-store'
import { useTeamOperationStore } from '../_store/organization-team-ui-store'
import {
  organizacionSchema,
  organizacionEquipoSchema
} from '../_schemas/organizacion.schema'
import { ENTITIES } from '@/shared/lib/database-entities'

export function useOrganizacionPush() {
  const router = useRouter()
  const orgStore = useOrganizationOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveOrganizacionAction,
    section: ENTITIES.ORGANIZACION,
    validators: {
      organizacion: organizacionSchema
    },
    onSuccess: () => {
      orgStore.cleanup()
      router.refresh()
    }
  }

  const { push, isPending, result, progress } = usePush(config)

  const save = async () => {
    // Flush any ops not yet written to journal (e.g. debounce window still open)
    await useJournalFlushRegistry.getState().flush(ENTITIES.ORGANIZACION)
    push().catch(() => {})
  }

  return { save, push, isPending, result, progress }
}

export function useOrganizacionEquipoPush() {
  const router = useRouter()
  const teamStore = useTeamOperationStore()

  const config: PushConfig = {
    source: journalPushSource,
    executor: saveOrganizacionEquipoAction,
    section: ENTITIES.ORGANIZACION_EQUIPO,
    validators: {
      organizacion_equipo: organizacionEquipoSchema
    },
    onSuccess: () => {
      teamStore.cleanup()
      router.refresh()
    }
  }

  const { push, isPending, result, progress } = usePush(config)

  const save = async () => {
    // Flush any ops not yet written to journal (e.g. debounce window still open)
    await useJournalFlushRegistry.getState().flush(ENTITIES.ORGANIZACION_EQUIPO)
    push().catch(() => {})
  }

  return { save, push, isPending, result, progress }
}
