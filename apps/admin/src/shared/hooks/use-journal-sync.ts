'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { EntityOperationStore } from '@/shared/operations/log/types'
import type { Entity } from '@/shared/lib/database-entities'
import { writeOperationIntoJournal } from '@/shared/lib/write-operation-into-journal'
import { useJournalFlushRegistry } from '@/shared/lib/journal-flush-registry'

interface UseJournalSyncOptions<T> {
  entity: Entity
  operationStore: UseBoundStore<StoreApi<EntityOperationStore<T>>>
  /**
   * Debounce delay in ms for auto-save path (direct edits: switches, text fields).
   * Dialog Apply should call flush() directly — it bypasses this timer.
   * @default 1000
   */
  debounceMs?: number
}

/**
 * Subscribes to the operation log and persists new operations to the journal
 * (IndexedDB) so they survive page reloads.
 *
 * Two write paths:
 * - Auto-save: debounced write triggered whenever ops count increases (direct edits).
 * - Manual flush: imperative flush() registered in JournalFlushRegistry, called by
 *   push hooks pre-push and by dialog Apply buttons.
 *
 * Deduplication: cursor-based — only ops with timestamp > lastFlushedTimestamp
 * are written. Cursor advances after each successful batch write.
 *
 * Guards:
 * - isPostCommitReset: skip write + reset cursor when cleanup() fires after a push
 *   or discard (operations=null, lastCommitAt!==null). router.refresh() is incoming
 *   and journal will be cleared by the push lifecycle.
 * - isFlushingRef mutex: prevents concurrent writes from debounce + manual flush.
 */
export function useJournalSync<T>({
  entity,
  operationStore,
  debounceMs = 1000
}: UseJournalSyncOptions<T>): void {
  const lastFlushedTimestampRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isFlushingRef = useRef(false)

  const flush = useCallback(async () => {
    // Cancel any pending debounce timer before acquiring the write lock
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Mutex: prevent concurrent flush calls (debounce + manual flush racing)
    if (isFlushingRef.current) return

    const state = operationStore.getState()

    // Guard: post-commit or post-discard reset.
    // cleanup() was called → operations=null, lastCommitAt set.
    // Push lifecycle will clear journal; useProjectionSync handles projection reset.
    const isPostCommitReset =
      state.operations === null && state.lastCommitAt !== null
    if (isPostCommitReset) return

    if (!state.operations || state.operations.length === 0) return

    // Cursor deduplication: only write ops newer than last flushed batch
    const opsToWrite = state.operations.filter(
      (op) => op.timestamp > lastFlushedTimestampRef.current
    )
    if (opsToWrite.length === 0) return

    isFlushingRef.current = true
    try {
      await writeOperationIntoJournal(opsToWrite, entity)
      // Advance cursor to max timestamp of the written batch
      lastFlushedTimestampRef.current = Math.max(
        ...opsToWrite.map((o) => o.timestamp)
      )
    } finally {
      isFlushingRef.current = false
    }
  }, [entity, operationStore])

  // Register flush in the global registry so push hooks can call it pre-push
  useEffect(() => {
    const { register, unregister } = useJournalFlushRegistry.getState()
    register(entity, flush)
    return () => unregister(entity)
  }, [entity, flush])

  // Subscribe to operationStore for auto-save with debounce
  useEffect(() => {
    const unsubscribe = operationStore.subscribe((state, prevState) => {
      // Guard: post-commit/post-discard reset — reset cursor for the next session
      const isPostCommitReset =
        state.operations === null && state.lastCommitAt !== null
      if (isPostCommitReset) {
        lastFlushedTimestampRef.current = 0
        return
      }

      // Only schedule when the log grows (append-only — every user action adds an op)
      const prev = prevState.operations?.length ?? 0
      const curr = state.operations?.length ?? 0
      if (curr <= prev) return

      // Debounce: reset timer on each new op so rapid edits coalesce into one write
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, debounceMs)
    })

    return () => {
      unsubscribe()
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      // Best-effort final flush on unmount (e.g. route navigation)
      // Promise is fire-and-forget; IndexedDB typically completes before unload
      flush()
    }
  }, [operationStore, debounceMs, flush])
}
