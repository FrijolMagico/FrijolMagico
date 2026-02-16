import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'
import { useOrganizationUIStore } from '../_store/organization-ui-store'

export function useOrganizationEffectiveData() {
  const { entities, ids } = useOrganizationUIStore(
    useShallow((state) => {
      const effective = state.getEffectiveData()
      return {
        entities: effective.entities,
        ids: effective.ids
      }
    })
  )

  // Memoize result based on stable state pieces
  return useMemo(() => {
    const id = ids[0]
    return id ? entities[id] : undefined
  }, [entities, ids])
}

export function useOrganizationHasChanges() {
  return useOrganizationUIStore((state) => state.getHasChanges())
}

export function useOrganizationHasUnsavedEdits() {
  return useOrganizationUIStore((state) => state.getHasUnsavedEdits())
}

export function useOrganizationChangesCount() {
  return useOrganizationUIStore((state) => {
    const applied = state.appliedChanges
    const current = state.currentEdits

    const appliedOps = applied?.operations ?? []
    const currentOps = current?.operations ?? []

    const uniqueIds = new Set([
      ...appliedOps.map((op) => op.id),
      ...currentOps.map((op) => op.id)
    ])

    return uniqueIds.size
  })
}

export function useOrganizationRemoteData() {
  return useOrganizationUIStore(
    useShallow((state) => {
      const remote = state.remoteData
      if (!remote) return null

      const id = remote.ids[0]
      return id ? remote.entities[id] : null
    })
  )
}

export function useOrganizationError() {
  return useOrganizationUIStore((state) => state.error)
}

export function useOrganizationActions() {
  return useOrganizationUIStore(
    useShallow((state) => ({
      set: state.set,
      setRemoteData: state.setRemoteData,
      update: state.update,
      commitCurrentEdits: state.commitCurrentEdits,
      clearAppliedChanges: state.clearAppliedChanges,
      clearCurrentEdits: state.clearCurrentEdits,
      reset: state.reset,
      setLoading: state.setLoading,
      setError: state.setError
    }))
  )
}

export function useOrganizationAppliedChanges() {
  return useOrganizationUIStore(useShallow((state) => state.appliedChanges))
}

export function useOrganizationCurrentEdits() {
  return useOrganizationUIStore(useShallow((state) => state.currentEdits))
}
