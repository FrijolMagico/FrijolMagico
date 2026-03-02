'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { useRouteChanges } from '@/shared/hooks/use-route-changes'
import { RouteSaveToolbar } from '@/shared/components/route-save-toolbar'
import {
  useOrganizacionPush,
  useOrganizacionEquipoPush
} from '../_hooks/use-organizacion-push'

export function GeneralSaveBar() {
  const { isDirty, discardAll } = useRouteChanges('/general')

  const { save: saveOrg, isPending: isPendingOrg, result: resultOrg } = useOrganizacionPush()
  const { save: saveTeam, isPending: isPendingTeam, result: resultTeam } =
    useOrganizacionEquipoPush()

  const lastToastRef = useRef<number>(0)

  // Single consolidated toast — fires once when both saves complete successfully
  useEffect(() => {
    if (
      resultOrg?.success &&
      resultTeam?.success &&
      !isPendingOrg &&
      !isPendingTeam
    ) {
      const now = Date.now()
      if (now - lastToastRef.current > 500) {
        lastToastRef.current = now
        toast.success('Guardado correctamente')
      }
    }
  }, [resultOrg, resultTeam, isPendingOrg, isPendingTeam])
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
