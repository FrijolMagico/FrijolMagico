'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCommit } from '@/shared/commit-system/hooks/use-commit'
import { useCommitDirty } from '@/shared/commit-system/hooks/use-commit-dirty'
import { createCommitConfig } from '@/shared/commit-system/lib/create-commit-config'
import { journalCommitSource } from '@/shared/lib/journal-commit-source'
import { saveCatalogoAction } from '../_actions/save-catalogo.action'
import { useCatalogOperationStore } from '../_store/catalog-ui-store'

export function useCatalogoCommit() {
  const router = useRouter()
  const store = useCatalogOperationStore()

  const config = createCommitConfig({
    source: journalCommitSource,
    executor: saveCatalogoAction,
    section: 'catalogo_artista',
    onSuccess: () => {
      store.resetStore()
      router.refresh()
      toast.success('Guardado correctamente')
    }
  })

  const { commit, isPending, result, progress } = useCommit(config)
  const { isDirty } = useCommitDirty(journalCommitSource, 'catalogo_artista')

  const save = () => {
    commit().catch(() => {
      toast.error('Error inesperado al guardar')
    })
  }

  return { save, commit, isPending, isDirty, result, progress }
}