'use client'

import { useCallback, useMemo } from 'react'
import { useSectionDirtyStore } from '@/shared/lib/section-dirty-store'
import { journalCommitSource } from '@/shared/lib/journal-commit-source'
import { ROUTE_ENTITY_MAP } from '@/shared/lib/database-entities'

export function useRouteChanges(routePath: string) {
  // Primary: synchronous dirty state from projection-driven read model
  const dirtyMap = useSectionDirtyStore((s) => s.dirtyMap)
  const entities = useMemo(() => ROUTE_ENTITY_MAP[routePath] ?? [], [routePath])
  const isDirty = useMemo(
    () => entities.some((e) => dirtyMap[e] ?? false),
    [entities, dirtyMap]
  )

  // noticeVisible mirrors isDirty — simplified from original journal-changed event pattern
  // The original "first dirty" behavior can be restored later if needed
  const noticeVisible = isDirty

  const dismissNotice = useCallback(() => {}, [])

  const discardAll = useCallback(async () => {
    const currentEntities = ROUTE_ENTITY_MAP[routePath] ?? []
    await Promise.all(currentEntities.map((e) => journalCommitSource.clear(e)))
    window.dispatchEvent(new CustomEvent('journal-changed'))
  }, [routePath])

  return { isDirty, noticeVisible, dismissNotice, discardAll }
}
