'use client'

import { useRouteChanges } from '@/shared/hooks/use-route-changes'
import { RouteSaveToolbar } from '@/shared/components/route-save-toolbar'
import { useEdicionPush } from '../_hooks/use-edicion-push'

export function EdicionSaveBar() {
  const { save, isPending } = useEdicionPush()
  const { isDirty, discardAll } = useRouteChanges('/eventos/ediciones')

  return (
    <RouteSaveToolbar
      isDirty={isDirty}
      onSave={save}
      onDiscard={discardAll}
      isPending={isPending}
    />
  )
}
