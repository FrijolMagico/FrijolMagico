'use client'

import { useSyncExternalStore, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { SharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import { getSharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import type {
  AssetQueueJob,
  AssetQueueSnapshot
} from '@/shared/assets-manager/client/queue'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'
import type { AssetQueueStatus } from '@/shared/assets-manager/client/queue'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TERMINAL: ReadonlySet<AssetQueueStatus> = new Set([
  ASSET_QUEUE_STATUS.COMPLETED,
  ASSET_QUEUE_STATUS.FAILED,
  ASSET_QUEUE_STATUS.CANCELLED
])

const isTerminal = (status: AssetQueueStatus): boolean => TERMINAL.has(status)
const SUCCESS_DISMISS_DELAY = 2_500

export function scheduleSuccessDismissal(
  jobId: string,
  setTimer: (callback: () => void, delay: number) => unknown,
  dismiss: (jobId: string) => void
): void {
  setTimer(() => dismiss(jobId), SUCCESS_DISMISS_DELAY)
}

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
  cancellingJobId: controlledCancelling
}: QueueFloatBarProps) {
  const router = useRouter()
  const [internalCancelling, setInternalCancelling] = useState<string | null>(
    null
  )
  const [dismissedSuccessJobId, setDismissedSuccessJobId] = useState<
    string | null
  >(null)
  const snapshot = useSyncExternalStore(
    (onStoreChange) =>
      store.subscribe((nextSnapshot: AssetQueueSnapshot) => {
        const completed = [...nextSnapshot.jobs]
          .reverse()
          .find((job) => job.status === ASSET_QUEUE_STATUS.COMPLETED)
        if (completed && completed.jobId !== dismissedSuccessJobId) {
          scheduleSuccessDismissal(
            completed.jobId,
            window.setTimeout,
            setDismissedSuccessJobId
          )
        }
        onStoreChange()
      }),
    store.getState,
    store.getState
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
          'bg-background items-center gap-3 rounded-lg border',
          'px-4 py-3 shadow-lg'
        )}
      >
        <Spinner />
        <span className='text-muted-foreground text-sm'>Cancelando…</span>
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
          store.remove(activeJob.jobId)
        },
        onRetry: () => {
          if (activeJob.failedStep === 'upload') {
            store.retryUpload(activeJob.jobId).catch(console.error)
          } else if (activeJob.failedStep === 'persist') {
            store.retryPersistence(activeJob.jobId).catch(console.error)
          }
        },
        onRefresh: router.refresh
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
        store.remove(lastFailed.jobId)
      },
      onRetry: () => {
        if (lastFailed.failedStep === 'upload') {
          store.retryUpload(lastFailed.jobId).catch(console.error)
        } else if (lastFailed.failedStep === 'persist') {
          store.retryPersistence(lastFailed.jobId).catch(console.error)
        }
      },
      onRefresh: router.refresh
    })
  }

  // ---- No active job but there are still enqueued jobs (waiting) ----
  const nextEnqueued = jobs.find(
    (j) => j.status === ASSET_QUEUE_STATUS.ENQUEUED
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

  const lastCompleted = [...jobs]
    .reverse()
    .find((job) => job.status === ASSET_QUEUE_STATUS.COMPLETED)
  if (lastCompleted && lastCompleted.jobId !== dismissedSuccessJobId) {
    return renderSucceeded(lastCompleted)
  }

  return null
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderProgress(job: AssetQueueJob, onCancel: () => void) {
  const label =
    job.status === ASSET_QUEUE_STATUS.UPLOADING ? 'Subiendo…' : 'Persistiendo…'

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2',
        'bg-background items-center gap-4 rounded-lg border',
        'max-w-[50vw] px-4 py-3 shadow-lg'
      )}
    >
      <div className='flex min-w-48 flex-col gap-2'>
        <div className='flex items-center justify-between text-sm'>
          <span>{label}</span>
          <span className='text-muted-foreground tabular-nums'>
            {formatBytes(job.totalBytes)}
          </span>
        </div>
        {renderStages(job.status)}
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
        'bg-background items-center gap-3 rounded-lg border',
        'px-4 py-3 shadow-lg'
      )}
    >
      <span className='text-sm'>En cola: {job.target}</span>
      <span className='text-muted-foreground text-xs'>
        {formatBytes(job.totalBytes)}
      </span>
      {renderStages(job.status)}
      <Button variant='outline' size='sm' onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  )
}

interface FailedHandlers {
  onCancel: () => void
  onRetry: () => void
  onRefresh: () => void
}

function renderFailed(job: AssetQueueJob, handlers: FailedHandlers) {
  if (job.error === 'AVATAR_CONFLICT') {
    return (
      <div
        className={cn(
          'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2',
          'bg-background items-center gap-3 rounded-lg border',
          'px-4 py-3 shadow-lg'
        )}
      >
        <span className='text-destructive text-sm'>
          El avatar cambió en otra sesión.
        </span>
        <Button variant='secondary' size='sm' onClick={handlers.onRefresh}>
          Actualizar
        </Button>
        <Button variant='outline' size='sm' onClick={handlers.onCancel}>
          Cancelar
        </Button>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2',
        'bg-background items-center gap-3 rounded-lg border',
        'px-4 py-3 shadow-lg'
      )}
    >
      <span className='text-destructive text-sm'>
        Error: {sanitizeError(job.error)}
      </span>
      {renderStages(job.status, job.failedStep)}
      <Button variant='secondary' size='sm' onClick={handlers.onRetry}>
        Reintentar
      </Button>
      <Button variant='outline' size='sm' onClick={handlers.onCancel}>
        Cancelar
      </Button>
    </div>
  )
}

function renderSucceeded(job: AssetQueueJob) {
  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2',
        'bg-background items-center gap-3 rounded-lg border px-4 py-3 shadow-lg'
      )}
    >
      <span className='text-sm'>Avatar actualizado</span>
      {renderStages(job.status)}
    </div>
  )
}

const QUEUE_STAGES = ['En cola', 'Subiendo', 'Persistiendo'] as const

function renderStages(
  status: AssetQueueStatus,
  failedStep: AssetQueueJob['failedStep'] = null
) {
  const activeIndex =
    status === ASSET_QUEUE_STATUS.ENQUEUED
      ? 0
      : status === ASSET_QUEUE_STATUS.UPLOADING
        ? 1
        : 2
  const failedIndex =
    failedStep === 'upload' ? 1 : failedStep === 'persist' ? 2 : -1

  return (
    <div aria-label='Etapas de carga' className='flex gap-1'>
      {QUEUE_STAGES.map((stage, index) => {
        const state =
          status === ASSET_QUEUE_STATUS.COMPLETED || index < activeIndex
            ? 'completed'
            : index === failedIndex
              ? 'failed'
              : index === activeIndex && status !== ASSET_QUEUE_STATUS.FAILED
                ? 'active'
                : 'pending'
        return (
          <span
            key={stage}
            data-stage-state={state}
            className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              state === 'completed' &&
                'bg-green-100 text-green-800 shadow-[0_0_8px_theme(colors.green.400)]',
              state === 'active' &&
                'animate-pulse bg-yellow-100 text-yellow-800',
              state === 'failed' && 'bg-red-100 text-red-800',
              state === 'pending' && 'bg-muted text-muted-foreground'
            )}
          >
            {stage}
          </span>
        )
      })}
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
