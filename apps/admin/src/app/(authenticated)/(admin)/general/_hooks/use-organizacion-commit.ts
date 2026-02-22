'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCommit } from '@/shared/commit-system/hooks/use-commit'
import { useCommitDirty } from '@/shared/commit-system/hooks/use-commit-dirty'
import { createCommitConfig } from '@/shared/commit-system/lib/create-commit-config'
import { journalCommitSource } from '@/shared/lib/journal-commit-source'
import { saveOrganizacionAction } from '../_actions/save-organizacion.action'
import { saveOrganizacionEquipoAction } from '../_actions/save-organizacion-equipo.action'
import { useOrganizationOperationStore } from '../_store/organization-ui-store'
import { useTeamOperationStore } from '../_store/organization-team-ui-store'

export function useOrganizacionCommit() {
  const router = useRouter()
  const orgStore = useOrganizationOperationStore()

  const config = createCommitConfig({
    source: journalCommitSource,
    executor: saveOrganizacionAction,
    section: 'organizacion',
    onSuccess: () => {
      orgStore.resetStore()
      router.refresh()
      toast.success('Guardado correctamente')
    }
  })

  const { commit, isPending, result, progress } = useCommit(config)
  const { isDirty } = useCommitDirty(journalCommitSource, 'organizacion')

  const save = () => {
    commit().catch(() => {
      toast.error('Error inesperado al guardar')
    })
  }

  return { save, commit, isPending, isDirty, result, progress }
}

export function useOrganizacionEquipoCommit() {
  const router = useRouter()
  const teamStore = useTeamOperationStore()

  const config = createCommitConfig({
    source: journalCommitSource,
    executor: saveOrganizacionEquipoAction,
    section: 'organizacion_equipo',
    onSuccess: () => {
      teamStore.resetStore()
      router.refresh()
      toast.success('Guardado correctamente')
    }
  })

  const { commit, isPending, result, progress } = useCommit(config)
  const { isDirty } = useCommitDirty(
    journalCommitSource,
    'organizacion_equipo'
  )

  const save = () => {
    commit().catch(() => {
      toast.error('Error inesperado al guardar')
    })
  }

  return { save, commit, isPending, isDirty, result, progress }
}