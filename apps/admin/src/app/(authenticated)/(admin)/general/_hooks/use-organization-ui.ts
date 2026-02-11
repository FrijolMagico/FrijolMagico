import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'
import { useOrganizationUIStore } from '../_store/organization-ui-store'

export function useOrganizationEffectiveData() {
  const { remoteData, appliedChanges, currentEdits } = useOrganizationUIStore(
    useShallow((state) => ({
      remoteData: state.remoteData,
      appliedChanges: state.appliedChanges,
      currentEdits: state.currentEdits
    }))
  )

  // Memoize result based on primitive state changes to prevent infinite loops
  return useMemo(() => {
    const state = useOrganizationUIStore.getState().getEffectiveData()
    const id = state.ids[0]
    return id ? state.entities[id] : undefined
  }, [remoteData, appliedChanges, currentEdits])
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
