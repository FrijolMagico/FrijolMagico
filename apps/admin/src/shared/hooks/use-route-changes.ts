'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { journalCommitSource } from '@/shared/lib/journal-commit-source'
import { ROUTE_ENTITY_MAP } from '@/shared/lib/database-entities'

export function useRouteChanges(routePath: string) {
  const entities = useMemo(() => ROUTE_ENTITY_MAP[routePath] ?? [], [routePath])
  const [isDirty, setIsDirty] = useState(false)
  const [noticeVisible, setNoticeVisible] = useState(false)
  const [checkedOnce, setCheckedOnce] = useState(false)

  const checkDirty = useCallback(async () => {
    const results = await Promise.all(
      entities.map((e) => journalCommitSource.hasPending(e))
    )
    const dirty = results.some(Boolean)
    setIsDirty(dirty)
    // Show notice only on first dirty detection (restored session), not on every user edit
    if (dirty && !checkedOnce) {
      setNoticeVisible(true)
      setCheckedOnce(true)
    }
    if (!dirty) {
      setNoticeVisible(false)
      setCheckedOnce(false)
    }
  }, [entities, checkedOnce])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    void checkDirty()
    window.addEventListener('journal-changed', checkDirty)
    return () => window.removeEventListener('journal-changed', checkDirty)
  }, [checkDirty])

  const dismissNotice = useCallback(() => setNoticeVisible(false), [])

  const discardAll = useCallback(async () => {
    // Note: The StoreInitialization components' useJournalRestore.discardAll() handles individual store resets.
    await Promise.all(entities.map((e) => journalCommitSource.clear(e)))
    window.dispatchEvent(new CustomEvent('journal-changed'))
    setIsDirty(false)
    setNoticeVisible(false)
  }, [entities])

  return { isDirty, noticeVisible, dismissNotice, discardAll }
}
