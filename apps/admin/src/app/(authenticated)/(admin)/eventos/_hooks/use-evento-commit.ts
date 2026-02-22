'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCommit } from '@/shared/commit-system/hooks/use-commit'
import { useCommitDirty } from '@/shared/commit-system/hooks/use-commit-dirty'
import { createCommitConfig } from '@/shared/commit-system/lib/create-commit-config'
import { journalCommitSource } from '@/shared/lib/journal-commit-source'
import { saveEventoAction } from '../_actions/save-evento.action'

export function useEventoCommit() {
  const router = useRouter()

  const config = createCommitConfig({
    source: journalCommitSource,
    executor: saveEventoAction,
    section: 'evento',
    onSuccess: () => {
      router.refresh()
      toast.success('Guardado correctamente')
    }
  })

  const { commit, isPending, result, progress } = useCommit(config)
  const { isDirty } = useCommitDirty(journalCommitSource, 'evento')

  const save = () => {
    commit().catch(() => {
      toast.error('Error inesperado al guardar')
    })
  }

  return { save, commit, isPending, isDirty, result, progress }
}