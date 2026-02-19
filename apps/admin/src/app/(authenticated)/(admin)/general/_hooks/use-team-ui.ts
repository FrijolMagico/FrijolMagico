import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'
import { useOrganizacionEquipoUIStore } from '../_store/organizacion-equipo-ui-store'
import { TeamMember } from '../_types'

/**
 * Hook para obtener todos los miembros del equipo.
 * Selecciona el estado normalizador y computa fuera del selector para evitar loops infinitos.
 */
export function useTeamEffectiveData(): TeamMember[] {
  const { entities, ids } = useOrganizacionEquipoUIStore(
    useShallow((state) => {
      const effective = state.getEffectiveData()
      return {
        entities: effective.entities,
        ids: effective.entityIds
      }
    })
  )

  // Compute effective data OUTSIDE the selector
  return useMemo(() => {
    return ids
      .map((id) => entities[id])
      .filter((e): e is TeamMember => Boolean(e))
      .filter((e) => !e.isDeleted)
  }, [entities, ids])
}
