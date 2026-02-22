'use client'

import { useEffect, useState } from 'react'
import { hasEntries } from '@/shared/change-journal/change-journal'
import type { SectionName } from '../lib/types'

/**
 * Hook to check if a journal section has pending entries
 *
 * Checks `hasEntries` on mount/remount to determine if the section
 * has any unsaved changes. Returns the boolean state.
 *
 * @param section - Section name to check for pending changes
 * @returns boolean - True if section has pending entries
 */
export function useJournalDirty(section: SectionName): boolean {
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkDirty = async () => {
      const hasPendingEntries = await hasEntries(section)
      if (mounted) {
        setIsDirty(hasPendingEntries)
      }
    }

    checkDirty()

    return () => {
      mounted = false
    }
  }, [section])

  return isDirty
}
