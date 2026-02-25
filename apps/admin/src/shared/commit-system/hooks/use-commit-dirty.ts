'use client'

import { useEffect, useState } from 'react'
import type { CommitSource } from '../lib/types'
import { useSectionDirtyStore } from '@/shared/lib/section-dirty-store'

export interface UseCommitDirtyResult {
  isDirty: boolean
  checkDirty: () => Promise<void>
}

/**
 * Generic dirty-check hook accepting CommitSource and section
 *
 * Checks hasPending on mount/remount to determine if there are pending changes.
 *
 * @param source - CommitSource implementation
 * @param section - Section name to check for pending changes
 * @returns UseCommitDirtyResult with isDirty boolean and checkDirty function
 *
 * @example
 * const { isDirty } = useCommitDirty(journalCommitSource, 'artista')
 */
export function useCommitDirty(
  source: CommitSource,
  section: string
): UseCommitDirtyResult {
  // Primary: synchronous read from projection-driven dirty store
  const dirtyFromStore = useSectionDirtyStore((s) => s.dirtyMap[section])

  // Fallback: async IndexedDB check for sections without a projection store (e.g. 'evento')
  const [dirtyFromJournal, setDirtyFromJournal] = useState(false)

  const checkDirty = async () => {
    if (dirtyFromStore !== undefined) return
    const hasPending = await source.hasPending(section)
    setDirtyFromJournal(hasPending)
  }

  useEffect(() => {
    if (dirtyFromStore !== undefined) return
    let mounted = true
    source.hasPending(section).then((hasPending) => {
      if (mounted) setDirtyFromJournal(hasPending)
    })
    return () => { mounted = false }
  }, [source, section, dirtyFromStore])

  const isDirty = dirtyFromStore !== undefined ? dirtyFromStore : dirtyFromJournal

  return { isDirty, checkDirty }
}
