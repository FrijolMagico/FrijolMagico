'use client'

import { RouteSaveToolbar } from '@/shared/components/route-save-toolbar'
import { useRouteChanges } from '@/shared/hooks/use-route-changes'
import { useEventoPush } from '../_hooks/use-evento-push'

export function EventoSaveBar() {
  const { save, isPending } = useEventoPush()
  const { isDirty, discardAll } = useRouteChanges('/eventos')

  return (
    <RouteSaveToolbar
      isDirty={isDirty}
      onSave={save}
      onDiscard={discardAll}
      isPending={isPending}
    />
  )
}
