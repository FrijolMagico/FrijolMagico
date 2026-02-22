'use client'

import { useEffect, useState } from 'react'
import type { CommitSource } from '../lib/types'

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
  const [isDirty, setIsDirty] = useState(false)

  const checkDirty = async () => {
    const hasPending = await source.hasPending(section)
    setIsDirty(hasPending)
  }

  useEffect(() => {
    let mounted = true

    const check = async () => {
      const hasPending = await source.hasPending(section)
      if (mounted) {
        setIsDirty(hasPending)
      }
    }

    check()

    return () => {
      mounted = false
    }
  }, [source, section])

  return { isDirty, checkDirty }
}
