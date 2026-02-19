import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'
import { useOrganizationUIStore } from '../_store/organization-ui-store'

export function useOrganizationEffectiveData() {
  const { entities, ids } = useOrganizationUIStore(
    useShallow((state) => {
      const effective = state.getEffectiveData()
      return {
        entities: effective.entities,
        ids: effective.entityIds
      }
    })
  )

  // Memoize result based on stable state pieces
  return useMemo(() => {
    const id = ids[0]
    return id !== undefined ? entities[id] : null
  }, [entities, ids])
}
