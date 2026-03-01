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
 * Pipeline: read → validate → sort → execute → onSuccess → clear
 *
 * @param config - PushConfig with source, executor, section, and optional onSuccess
 * @returns UsePushResult with push function, isPending, result, and progress
 *
 * @example
 * const { push, isPending, result } = usePush({
 *   source: journalPushSource,
 *   executor: saveArtistaAction,
 *   section: 'artista',
 *   onSuccess: () => {
 *     store.resetStore()
 *     router.refresh()
 *   }
 * })
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

        setProgress({ phase: 'validating', total: operations.length })

        const validationResult = validatePushOperations(operations)
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
          config.onSuccess?.()

          setProgress({ phase: 'clearing' })

          await config.source.clear(config.section)
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
