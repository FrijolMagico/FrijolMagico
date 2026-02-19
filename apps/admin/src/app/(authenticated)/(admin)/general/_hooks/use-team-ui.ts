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
        ids: effective.ids
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

/**
 * Hook para obtener un miembro específico por ID.
 * Selecciona el estado normalizado para evitar crear nuevos objetos en cada render.
 */
export function useTeamById(id: string | number) {
  return useOrganizacionEquipoUIStore(
    (state) => state.getEffectiveData().entities[String(id)]
  )
}

/**
 * Hook para obtener el total de miembros.
 */
export function useTeamTotal() {
  return useOrganizacionEquipoUIStore((state) => state.selectTotal())
}

/**
 * Hook para verificar si hay cambios pendientes.
 */
export function useTeamHasChanges() {
  return useOrganizacionEquipoUIStore((state) => state.getHasChanges())
}

/**
 * Hook para verificar si hay ediciones sin guardar.
 */
export function useTeamHasUnsavedEdits() {
  return useOrganizacionEquipoUIStore((state) => state.getHasUnsavedEdits())
}

/**
 * Hook para datos remotos originales (como array).
 * Selecciona los state pieces estables; el mapeo se realiza fuera del selector.
 */
export function useTeamRemoteData() {
  const rawState = useOrganizacionEquipoUIStore(
    useShallow((state) => ({
      ids: state.remoteData?.ids ?? [],
      entities: state.remoteData?.entities ?? {}
    }))
  )

  return useMemo(() => {
    if (rawState.ids.length === 0) return null

    return rawState.ids
      .map((id) => rawState.entities[id])
      .filter((entity): entity is TeamMember => Boolean(entity))
  }, [rawState.ids, rawState.entities])
}

/**
 * Hook selector para estado de error.
 */
export function useTeamError() {
  return useOrganizacionEquipoUIStore((state) => state.error)
}

/**
 * Hook agrupado para acciones.
 * Adaptado para API Entity State de colección.
 */
export function useTeamActions() {
  return useOrganizacionEquipoUIStore(
    useShallow((state) => ({
      // Layer 1
      setRemoteData: state.setRemoteData,

      // Layer 3 (single operations)
      addOne: state.addOne,
      updateOne: state.updateOne,
      removeOne: state.removeOne,
      upsertOne: state.upsertOne,

      // Layer 3 (bulk operations)
      addMany: state.addMany,
      updateMany: state.updateMany,
      removeMany: state.removeMany,
      setAll: state.setAll,

      // Layer 2
      commitCurrentEdits: state.commitCurrentEdits,
      clearAppliedChanges: state.clearAppliedChanges,
      clearCurrentEdits: state.clearCurrentEdits,

      // Utilities
      reset: state.reset,
      setLoading: state.setLoading,
      setError: state.setError
    }))
  )
}

/**
 * Re-export TeamMember type for convenience
 */
export type { TeamMember }
