'use client'

import { useCallback, useMemo } from 'react'
import { useSectionDirtyStore } from '@/shared/lib/section-dirty-store'
import { ROUTE_ENTITY_MAP } from '@/shared/lib/database-entities'
import { useDiscardRegistry } from '@/shared/lib/discard-registry'

export function useRouteChanges(routePath: string) {
  const dirtyMap = useSectionDirtyStore((s) => s.dirtyMap)
  const entities = useMemo(() => ROUTE_ENTITY_MAP[routePath] ?? [], [routePath])
  const isDirty = useMemo(
    () => entities.some((e) => dirtyMap[e] ?? false),
    [entities, dirtyMap]
  )

  const discardAll = useCallback(async () => {
    await useDiscardRegistry.getState().discardEntities(entities)
  }, [entities])

  return { isDirty, discardAll }
}
