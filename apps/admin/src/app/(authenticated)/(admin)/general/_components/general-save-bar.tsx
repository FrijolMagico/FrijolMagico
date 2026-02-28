'use client'

import { useRouteChanges } from '@/shared/hooks/use-route-changes'
import { RouteSaveToolbar } from '@/shared/components/route-save-toolbar'
import {
  useOrganizacionPush,
  useOrganizacionEquipoPush
} from '../_hooks/use-organizacion-push'

export function GeneralSaveBar() {
  const { isDirty, discardAll } = useRouteChanges('/general')

  const { save: saveOrg, isPending: isPendingOrg } = useOrganizacionPush()
  const { save: saveTeam, isPending: isPendingTeam } =
    useOrganizacionEquipoPush()

  const handleSave = () => {
    // Parallel saves are safe: ORGANIZATION_ID is a singleton (always ID=1, never created from UI).
    // No FK dependency between organizacion and organizacion_equipo saves at commit time.
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
