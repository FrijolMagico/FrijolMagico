'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { journalCommitSource } from '@/shared/lib/journal-commit-source'
import { ROUTE_ENTITY_MAP } from '@/shared/lib/database-entities'

export function useRouteChanges(routePath: string) {

  const [isDirty, setIsDirty] = useState(false)
  const [noticeVisible, setNoticeVisible] = useState(false)
  const checkedOnceRef = useRef(false)

  const checkDirty = useCallback(async () => {
    const entities = ROUTE_ENTITY_MAP[routePath] ?? []
    const results = await Promise.all(
      entities.map((e) => journalCommitSource.hasPending(e))
    )
    const dirty = results.some(Boolean)
    setIsDirty(dirty)
    // Show notice only on first dirty detection (restored session), not on every user edit
    if (dirty && !checkedOnceRef.current) {
      setNoticeVisible(true)
      checkedOnceRef.current = true
    }
    if (!dirty) {
      setNoticeVisible(false)
      checkedOnceRef.current = false
    }
  }, [routePath])

  useEffect(() => {
    window.addEventListener('journal-changed', checkDirty)
    window.dispatchEvent(new CustomEvent('journal-changed'))
    return () => window.removeEventListener('journal-changed', checkDirty)
  }, [checkDirty])

  const dismissNotice = useCallback(() => setNoticeVisible(false), [])

  const discardAll = useCallback(async () => {
    // Note: The StoreInitialization components' useJournalRestore.discardAll() handles individual store resets.
    const entities = ROUTE_ENTITY_MAP[routePath] ?? []
    await Promise.all(entities.map((e) => journalCommitSource.clear(e)))
    window.dispatchEvent(new CustomEvent('journal-changed'))
    setIsDirty(false)
    setNoticeVisible(false)
  }, [routePath])

  return { isDirty, noticeVisible, dismissNotice, discardAll }
}
