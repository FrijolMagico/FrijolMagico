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
    // TODO(journal-ux): Remote save pending UX approval
    // Current: Saves to IndexedDB only. Uncomment below when ready:
    // commit().catch(() => { toast.error('Error inesperado al guardar') })
    
    // For now: show that button works
    toast.info('Cambios guardados localmente')
  }

  return { save, commit, isPending, isDirty, result, progress }
}