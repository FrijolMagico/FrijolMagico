'use client'

import { useRouteChanges } from '@/shared/hooks/use-route-changes'
import { RouteSaveToolbar } from '@/shared/components/route-save-toolbar'
import { RestoredChangesNotice } from '@/shared/components/restored-changes-notice'
import {
  useOrganizacionCommit,
  useOrganizacionEquipoCommit
} from '../_hooks/use-organizacion-commit'

export function GeneralSaveBar() {
  const { isDirty, noticeVisible, dismissNotice, discardAll } =
    useRouteChanges('/general')
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
      <RestoredChangesNotice
        visible={noticeVisible}
        onDismiss={dismissNotice}
      />
    </>
  )
}
