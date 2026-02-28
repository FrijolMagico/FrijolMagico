'use client'

import { useState, useTransition } from 'react'
import type {
  CommitConfig,
  CommitResult,
  CommitProgress
} from '../lib/types'





import {
  sortCommitOperations,
  validateCommitOperations
} from '../lib/operation-sorter'

export interface UseCommitResult {
  commit: () => Promise<void>
  isPending: boolean
  result: CommitResult | null
  progress: CommitProgress | null
}

/**
 * Generic commit orchestrator hook
 *
 * Pipeline: read → validate → sort → execute → onSuccess → clear
 *
 * @param config - CommitConfig with source, executor, section, and optional onSuccess
 * @returns UseCommitResult with commit function, isPending, result, and progress
 *
 * @example
 * const { commit, isPending, result } = useCommit({
 *   source: journalCommitSource,
 *   executor: saveArtistaAction,
 *   section: 'artista',
 *   onSuccess: () => {
 *     store.resetStore()
 *     router.refresh()
 *   }
 * })
 */
export function useCommit(config: CommitConfig): UseCommitResult {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<CommitResult | null>(null)
  const [progress, setProgress] = useState<CommitProgress | null>(null)

  const commit = async () => {
    startTransition(async () => {
      try {
        setProgress({ phase: 'reading' })

        const operations = await config.source.read(config.section)

        if (operations.length === 0) {
          setResult({ success: true })
          setProgress(null)
          return
        }

        setProgress({ phase: 'validating', total: operations.length })

        const validationResult = validateCommitOperations(operations)
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
        const sortedOps = sortCommitOperations(operations)

        // No-op cancellation: if all ops cancelled each other out, skip executor
        if (sortedOps.length === 0) {
          await config.source.clear(config.section)
          config.onSuccess?.()
          setProgress(null)
          return
        }

        setProgress({ phase: 'executing', total: sortedOps.length })

        const execResult = await config.executor(sortedOps)
        setResult(execResult)

        if (execResult.success) {
          config.onSuccess?.()


          setProgress({ phase: 'clearing' })

          await config.source.clear(config.section)
        }

        setProgress(null)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error during commit'
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

  return { commit, isPending, result, progress }
}
