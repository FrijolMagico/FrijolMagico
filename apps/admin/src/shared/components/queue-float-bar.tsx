'use client'

import { useSyncExternalStore, useState, useCallback } from 'react'

import type { SharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import { getSharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import type { AssetQueueJob, AssetQueueSnapshot } from '@/shared/assets-manager/client/queue'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'
import type { AssetQueueStatus } from '@/shared/assets-manager/client/queue'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Progress } from '@/shared/components/ui/progress'
import { Spinner } from '@/shared/components/ui/spinner'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TERMINAL: ReadonlySet<AssetQueueStatus> = new Set([
  ASSET_QUEUE_STATUS.COMPLETED,
  ASSET_QUEUE_STATUS.FAILED,
  ASSET_QUEUE_STATUS.CANCELLED,
])

const isTerminal = (status: AssetQueueStatus): boolean => TERMINAL.has(status)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strips multiline stack traces and limits error length to prevent leaking
 * internal server details to end users. */
function sanitizeError(error: string | null): string | null {
  if (!error) return null
  return error.split('\n')[0]?.slice(0, 200) ?? null
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface QueueFloatBarProps {
  /** Defaults to the global shared store. Inject a mock for tests. */
  store?: SharedAssetQueueStore
  /**
   * @internal — allows tests to set the cancelling state directly. In
   * production the component manages this internally via useState.
   */
  cancellingJobId?: string | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QueueFloatBar({
  store = getSharedAssetQueueStore(),
  cancellingJobId: controlledCancelling,
}: QueueFloatBarProps) {
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      store.subscribe(onStoreChange as (state: AssetQueueSnapshot) => void),
    [store],
  )

  const getSnapshot = useCallback(() => store.getState(), [store])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const [internalCancelling, setInternalCancelling] = useState<string | null>(
    null,
  )
  const cancellingJobId =
    controlledCancelling !== undefined
      ? controlledCancelling
      : internalCancelling

  const { jobs } = snapshot
  const activeJob = snapshot.activeJobId
    ? (jobs.find((j) => j.jobId === snapshot.activeJobId) ?? null)
    : null

  // If the cancelling job has already become terminal (the cancel completed
  // synchronously in the store), clear the cancelling state immediately
  // during render instead of wiring a useEffect.
  if (controlledCancelling === undefined && cancellingJobId) {
    const job = jobs.find((j) => j.jobId === cancellingJobId)
    if (!job || isTerminal(job.status)) {
      setInternalCancelling(null)
    }
  }

  // ---- Cancelling state ----
  if (cancellingJobId) {
    return (
      <div
        className={cn(
          'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2',
          'items-center gap-3 rounded-lg border bg-background',
          'px-4 py-3 shadow-lg',
        )}
      >
        <Spinner />
        <span className='text-sm text-muted-foreground'>Cancelando…</span>
      </div>
    )
  }

  // ---- Active job states ----
  if (activeJob) {
    if (
      activeJob.status === ASSET_QUEUE_STATUS.UPLOADING ||
      activeJob.status === ASSET_QUEUE_STATUS.PERSISTING
    ) {
      return renderProgress(activeJob, () => {
        setInternalCancelling(activeJob.jobId)
        try {
          store.cancel(activeJob.jobId)
        } catch {
          setInternalCancelling(null)
        }
      })
    }

    if (activeJob.status === ASSET_QUEUE_STATUS.ENQUEUED) {
      return renderEnqueued(activeJob, () => {
        setInternalCancelling(activeJob.jobId)
        try {
          store.cancel(activeJob.jobId)
        } catch {
          setInternalCancelling(null)
        }
      })
    }

    if (activeJob.status === ASSET_QUEUE_STATUS.FAILED) {
      return renderFailed(activeJob, {
        onCancel: () => {
          setInternalCancelling(activeJob.jobId)
          try {
            store.cancel(activeJob.jobId)
          } catch {
            setInternalCancelling(null)
          }
        },
        onRetry: () => {
          if (activeJob.failedStep === 'upload') {
            store.retryUpload(activeJob.jobId).catch(console.error)
          } else if (activeJob.failedStep === 'persist') {
            store.retryPersistence(activeJob.jobId).catch(console.error)
          }
        },
      })
    }
  }

  // ---- No active job: show the last failed job so user can retry/dismiss ----
  const lastFailed = [...jobs]
    .reverse()
    .find((j) => j.status === ASSET_QUEUE_STATUS.FAILED)

  if (lastFailed) {
    return renderFailed(lastFailed, {
      onCancel: () => {
        setInternalCancelling(lastFailed.jobId)
        try {
          store.cancel(lastFailed.jobId)
        } catch {
          setInternalCancelling(null)
        }
      },
      onRetry: () => {
        if (lastFailed.failedStep === 'upload') {
          store.retryUpload(lastFailed.jobId).catch(console.error)
        } else if (lastFailed.failedStep === 'persist') {
          store.retryPersistence(lastFailed.jobId).catch(console.error)
        }
      },
    })
  }

  // No active job + no failed job + all jobs terminal or empty → hidden
  if (jobs.every((j) => isTerminal(j.status))) {
    return null
  }

  // ---- No active job but there are still enqueued jobs (waiting) ----
  const nextEnqueued = jobs.find(
    (j) => j.status === ASSET_QUEUE_STATUS.ENQUEUED,
  )
  if (nextEnqueued) {
    return renderEnqueued(nextEnqueued, () => {
      setInternalCancelling(nextEnqueued.jobId)
      try {
        store.cancel(nextEnqueued.jobId)
      } catch {
        setInternalCancelling(null)
      }
    })
  }

  return null
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderProgress(job: AssetQueueJob, onCancel: () => void) {
  const percentage =
    job.totalBytes > 0
      ? Math.round((job.sentBytes / job.totalBytes) * 100)
      : 0

  const label =
    job.status === ASSET_QUEUE_STATUS.UPLOADING
      ? 'Subiendo…'
      : 'Persistiendo…'

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2',
        'items-center gap-4 rounded-lg border bg-background',
        'px-4 py-3 shadow-lg max-w-[50vw]',
      )}
    >
      <div className='flex flex-col gap-0.5 min-w-48'>
        <div className='flex items-center justify-between text-sm'>
          <span>{label}</span>
          <span className='text-muted-foreground tabular-nums'>
            {formatBytes(job.sentBytes)} / {formatBytes(job.totalBytes)}
          </span>
        </div>
        <Progress value={percentage} />
      </div>
      <Button variant='outline' size='sm' onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  )
}

function renderEnqueued(job: AssetQueueJob, onCancel: () => void) {
  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2',
        'items-center gap-3 rounded-lg border bg-background',
        'px-4 py-3 shadow-lg',
      )}
    >
      <span className='text-sm'>En cola: {job.target}</span>
      <Button variant='outline' size='sm' onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  )
}

interface FailedHandlers {
  onCancel: () => void
  onRetry: () => void
}

function renderFailed(job: AssetQueueJob, handlers: FailedHandlers) {
  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2',
        'items-center gap-3 rounded-lg border bg-background',
        'px-4 py-3 shadow-lg',
      )}
    >
      <span className='text-sm text-destructive'>
        Error: {sanitizeError(job.error)}
      </span>
      <Button variant='secondary' size='sm' onClick={handlers.onRetry}>
        Reintentar
      </Button>
      <Button variant='outline' size='sm' onClick={handlers.onCancel}>
        Cancelar
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
