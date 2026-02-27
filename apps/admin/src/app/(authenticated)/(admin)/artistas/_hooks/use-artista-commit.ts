'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCommit } from '@/shared/commit-system/hooks/use-commit'
import { useCommitDirty } from '@/shared/commit-system/hooks/use-commit-dirty'
import { createCommitConfig } from '@/shared/commit-system/lib/create-commit-config'
import { journalCommitSource } from '@/shared/lib/journal-commit-source'
import { saveArtistaAction } from '../_actions/save-artista.action'
import { useArtistsOperationStore } from '../_store/artista-ui-store'

export function useArtistaCommit() {
  const router = useRouter()
  const store = useArtistsOperationStore()

  const config = createCommitConfig({
    source: journalCommitSource,
    executor: saveArtistaAction,
    section: 'artista',
    onSuccess: () => {
      store.resetStore()
      router.refresh()
      toast.success('Guardado correctamente')
    }
  })

  const { commit, isPending, result, progress } = useCommit(config)
  const { isDirty } = useCommitDirty(journalCommitSource, 'artista')

  const save = () => {
    commit().catch(() => {
      toast.error('Error inesperado al guardar')
    })
  }

  return { save, commit, isPending, isDirty, result, progress }
}