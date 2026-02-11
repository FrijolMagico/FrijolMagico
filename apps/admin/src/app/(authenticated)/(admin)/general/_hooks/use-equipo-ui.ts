import { useShallow } from 'zustand/react/shallow'
import { useEquipoUIStore, type TeamMember } from '../_store/equipo-ui-store'

/**
 * Hook para obtener todos los miembros del equipo.
 * Selecciona el estado normalizador y computa fuera del selector para evitar loops infinitos.
 */
export function useEquipoEffectiveData(): TeamMember[] {
  // Select the RAW state pieces that ARE stable references
  const rawState = useEquipoUIStore(
    useShallow((state) => ({
      remoteData: state.remoteData,
      appliedChanges: state.appliedChanges,
      currentEdits: state.currentEdits
    }))
  )

  // Compute effective data OUTSIDE the selector
  if (!rawState.remoteData) return []

  const entities: Record<string, TeamMember> = {
    ...rawState.remoteData.entities
  }
  const deletedIds = new Set<string>()
  const addedIds = new Set<string>()

  const allOps = [
    ...(rawState.appliedChanges?.operations ?? []),
    ...(rawState.currentEdits?.operations ?? [])
  ].sort((a, b) => a.timestamp - b.timestamp)

  for (const op of allOps) {
    switch (op.type) {
      case 'ADD':
        entities[op.id] = op.entity as TeamMember
        addedIds.add(op.id)
        deletedIds.delete(op.id)
        break
      case 'UPDATE':
        if (entities[op.id]) {
          entities[op.id] = { ...entities[op.id], ...op.data } as TeamMember
        }
        break
      case 'DELETE':
        delete entities[op.id]
        deletedIds.add(op.id)
        addedIds.delete(op.id)
        break
    }
  }

  const ids = rawState.remoteData.ids
    .filter((id) => !deletedIds.has(id))
    .concat([...addedIds])

  return ids
    .map((id) => entities[id])
    .filter((e): e is TeamMember => Boolean(e))
    .filter((e) => !e.isDeleted)
}

/**
 * Hook para obtener un miembro específico por ID.
 * Selecciona el estado normalizado para evitar crear nuevos objetos en cada render.
 */
export function useEquipoById(id: string | number) {
  return useEquipoUIStore(
    (state) => state.getEffectiveData().entities[String(id)]
  )
}

/**
 * Hook para obtener el total de miembros.
 */
export function useEquipoTotal() {
  return useEquipoUIStore((state) => state.selectTotal())
}

/**
 * Hook para verificar si hay cambios pendientes.
 */
export function useEquipoHasChanges() {
  return useEquipoUIStore((state) => state.getHasChanges())
}

/**
 * Hook para verificar si hay ediciones sin guardar.
 */
export function useEquipoHasUnsavedEdits() {
  return useEquipoUIStore((state) => state.getHasUnsavedEdits())
}

/**
 * Hook para datos remotos originales (como array).
 * Selecciona los state pieces estables; el mapeo se realiza fuera del selector.
 */
export function useEquipoRemoteData() {
  const remoteData = useEquipoUIStore(
    useShallow((state) => ({
      ids: state.remoteData?.ids ?? [],
      entities: state.remoteData?.entities ?? {}
    }))
  )

  if (remoteData.ids.length === 0) return null

  return remoteData.ids
    .map((id) => remoteData.entities[id])
    .filter((entity): entity is TeamMember => Boolean(entity))
}

/**
 * Hook selector para estado de error.
 */
export function useEquipoError() {
  return useEquipoUIStore((state) => state.error)
}

/**
 * Hook agrupado para acciones.
 * Adaptado para API Entity State de colección.
 */
export function useEquipoActions() {
  return useEquipoUIStore(
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
