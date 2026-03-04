'use client'

import { useState, useTransition } from 'react'
import type { PushConfig, PushResult, PushProgress } from '../lib/types'

import {
  sortPushOperations,
  validatePushOperations
} from '../lib/operation-resolver'

export interface UsePushResult {
  push: () => Promise<void>
  isPending: boolean
  result: PushResult | null
  progress: PushProgress | null
}

/**
 * Generic push orchestrator hook
 *
 * Pipeline: read → validate → sort → execute → clear → onSuccess
 *
 * Order matters:
 * - source.clear() (journal) fires BEFORE onSuccess() (store.cleanup()).
 *   This ensures no in-flight debounce from useJournalSync can write ops to
 *   a journal that is about to be cleared.
 * - onSuccess() calls store.cleanup() which sets operations=null + lastCommitAt=now.
 *   useDirtySync's operationStore channel fires setDirty(false) synchronously —
 *   still inside the React transition — so isDirty is false by the time
 *   isPending becomes false. Prevents the save bar from flashing back.
 *
 * @param config - PushConfig with source, executor, section, and optional onSuccess
 * @returns UsePushResult with push function, isPending, result, and progress
 */
export function usePush(config: PushConfig): UsePushResult {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<PushResult | null>(null)
  const [progress, setProgress] = useState<PushProgress | null>(null)

  const push = async () => {
    startTransition(async () => {
      try {
        setProgress({ phase: 'reading' })

        const operations = await config.source.read(config.section)

        if (operations.length === 0) {
          setResult({ success: true })
          setProgress(null)
          return
        }

        const validationResult = validatePushOperations(
          operations,
          config.validators
        )

        if (!validationResult.valid) {
          setResult({
            success: false,
            errors: validationResult.errors.map((msg: string, idx: number) => ({
              entityType: 'unknown',
              entityId: `error-${idx}`,
              message: msg
            }))
          })
          setProgress(null)
          return
        }

        setProgress({
          phase: 'validating',
          current: operations.length,
          total: operations.length
        })

        const sortedOps = sortPushOperations(operations)

        // No-op cancellation: if all ops cancelled each other out, skip executor
        if (sortedOps.length === 0) {
          await config.source.clear(config.section)
          config.onSuccess?.()
          setResult({ success: true, idMappings: [] })
          setProgress(null)
          return
        }

        setProgress({ phase: 'executing', total: sortedOps.length })

        const execResult = await config.executor(sortedOps)
        setResult(execResult)

        if (execResult.success) {
          // 1. Clear journal before clearing operations.
          //    Prevents the useJournalSync cursor-reset from losing ops written
          //    between cleanup() and clearSection().
          setProgress({ phase: 'clearing' })
          await config.source.clear(config.section)

          // 2. Clear operations + trigger router.refresh().
          //    useDirtySync operationStore channel fires setDirty(false) here,
          //    synchronously, before the transition ends and isPending=false.
          config.onSuccess?.()
        }

        setProgress(null)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error during push'
        setResult({
          success: false,
          errors: [
            {
              entityType: 'unknown',
              entityId: 'unknown',
              message: errorMessage
            }
          ]
        })
        setProgress(null)
      }
    })
  }

  return { push, isPending, result, progress }
}
