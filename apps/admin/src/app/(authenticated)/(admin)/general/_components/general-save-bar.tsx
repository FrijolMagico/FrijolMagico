'use client'

import { useRouteChanges } from '@/shared/hooks/use-route-changes'
import { RouteSaveToolbar } from '@/shared/components/route-save-toolbar'
import {
  useOrganizacionCommit,
  useOrganizacionEquipoCommit
} from '../_hooks/use-organizacion-commit'

export function GeneralSaveBar() {
  const { isDirty, discardAll } = useRouteChanges('/general')

  const { save: saveOrg, isPending: isPendingOrg } = useOrganizacionCommit()
  const { save: saveTeam, isPending: isPendingTeam } =
    useOrganizacionEquipoCommit()

  const handleSave = () => {
    // TODO: Verify sequential commit ordering and ID mapping for multi-entity routes
    saveOrg()
    saveTeam()
  }

  return (
    <>
      <RouteSaveToolbar
        isDirty={isDirty}
        onSave={handleSave}
        onDiscard={discardAll}
        isPending={isPendingOrg || isPendingTeam}
      />
    </>
  )
}
