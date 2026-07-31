import type {
  AssetTarget,
  LocalPreviewHandle,
  PreparedAsset
} from './contracts'

// ---------------------------------------------------------------------------
// Constants and types
// ---------------------------------------------------------------------------

export const ASSET_QUEUE_STATUS = {
  ENQUEUED: 'enqueued',
  UPLOADING: 'uploading',
  PERSISTING: 'persisting',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const
export type AssetQueueStatus =
  (typeof ASSET_QUEUE_STATUS)[keyof typeof ASSET_QUEUE_STATUS]

export interface AssetQueueJob {
  jobId: string
  target: AssetTarget
  entityId: string
  preparedAsset: PreparedAsset
  preview: LocalPreviewHandle | null
  status: AssetQueueStatus
  sentBytes: number
  totalBytes: number
  error: string | null
  failedStep: 'upload' | 'persist' | null
}

export interface AssetQueueSnapshot {
  jobs: AssetQueueJob[]
  activeJobId: string | null
}

type Listener = () => void

export interface AssetQueueOperations {
  upload: (job: AssetQueueJob) => Promise<void>
  persist: (job: AssetQueueJob) => Promise<void>
}

export interface AssetQueueRetryOptions {
  maxRetries?: number
  baseDelay?: number
  timeout?: number
}

type RetryStep = NonNullable<AssetQueueJob['failedStep']>

interface RetryReservation {
  token: string
  generationKey: string
  generation: number
  step: RetryStep
}

const TERMINAL = new Set<AssetQueueStatus>([
  ASSET_QUEUE_STATUS.COMPLETED,
  ASSET_QUEUE_STATUS.FAILED,
  ASSET_QUEUE_STATUS.CANCELLED
])

// ---------------------------------------------------------------------------
// AssetQueue interface
// ---------------------------------------------------------------------------

export interface AssetQueue {
  enqueue: (
    target: AssetTarget,
    entityId: string,
    preparedAsset: PreparedAsset,
    preview?: LocalPreviewHandle
  ) => AssetQueueJob
  startUpload: (jobId: string) => void
  setProgress: (jobId: string, sentBytes: number) => void
  completeUpload: (jobId: string) => void
  completePersistence: (jobId: string) => void
  fail: (jobId: string, error: string) => void
  retryUpload: (jobId: string) => Promise<void>
  retryPersistence: (jobId: string) => Promise<void>
  cancel: (jobId: string) => void
  remove: (jobId: string) => void
  subscribe: (listener: Listener) => () => void
  getSnapshot: () => AssetQueueSnapshot
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createAssetQueue(
  createId: () => string = () => crypto.randomUUID(),
  operations?: Partial<AssetQueueOperations>,
  retryOptions: AssetQueueRetryOptions = {}
): AssetQueue {
  let snapshot: AssetQueueSnapshot = { jobs: [], activeJobId: null }
  const knownJobIds = new Set<string>()
  const listeners = new Set<Listener>()
  const retries = new Map<string, number>()
  const reservations = new Map<string, RetryReservation>()
  const generations = new Map<string, number>()
  const maxRetries = Math.max(0, retryOptions.maxRetries ?? 3)
  const baseDelay = Math.max(0, retryOptions.baseDelay ?? 250)
  const timeout = Math.max(1, retryOptions.timeout ?? 30_000)

  const notify = () => {
    for (const listener of listeners) listener()
  }

  const jobFor = (jobId: string) =>
    snapshot.jobs.find((j) => j.jobId === jobId)

  const cloneJob = (job: AssetQueueJob): AssetQueueJob => ({
    ...job,
    preparedAsset: { ...job.preparedAsset }
  })

  const release = (job: AssetQueueJob) => {
    job.preview?.release()
  }

  const retryKey = (jobId: string, step: RetryStep) => `${jobId}:${step}`
  const generationKeyFor = (target: AssetTarget, entityId: string) =>
    `${target}\u0000${entityId}`
  const wait = (delay: number) => new Promise<void>((resolve) => setTimeout(resolve, delay))

  const isReserved = (
    jobId: string,
    reservation: RetryReservation,
    status: AssetQueueStatus,
    failedStep?: RetryStep
  ) => {
    const job = jobFor(jobId)
    return (
      reservations.get(jobId)?.token === reservation.token &&
      generations.get(reservation.generationKey) === reservation.generation &&
      job?.status === status &&
      (failedStep === undefined || job.failedStep === failedStep) &&
      snapshot.activeJobId === (status === ASSET_QUEUE_STATUS.FAILED ? null : jobId)
    )
  }

  const retry = async (jobId: string, step: RetryStep) => {
    const operation = operations?.[step === 'upload' ? 'upload' : 'persist']
    const job = jobFor(jobId)
    const key = retryKey(jobId, step)
    if (
      !operation ||
      !job ||
      job.status !== ASSET_QUEUE_STATUS.FAILED ||
      job.failedStep !== step ||
      snapshot.activeJobId !== null ||
      reservations.has(jobId) ||
      (retries.get(key) ?? 0) >= maxRetries
    )
      return

    const reservation: RetryReservation = {
      token: createId(),
      generationKey: generationKeyFor(job.target, job.entityId),
      generation: generations.get(generationKeyFor(job.target, job.entityId)) ?? 0,
      step
    }
    reservations.set(jobId, reservation)
    retries.set(key, (retries.get(key) ?? 0) + 1)
    await wait(baseDelay * 2 ** ((retries.get(key) ?? 1) - 1))
    if (!isReserved(jobId, reservation, ASSET_QUEUE_STATUS.FAILED, step)) return

    const activeStatus = step === 'upload'
      ? ASSET_QUEUE_STATUS.UPLOADING
      : ASSET_QUEUE_STATUS.PERSISTING
    snapshot = {
      activeJobId: jobId,
      jobs: snapshot.jobs.map((current) =>
        current.jobId === jobId
          ? { ...current, status: activeStatus, error: null, failedStep: null }
          : current
      )
    }
    notify()

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        operation(cloneJob(jobFor(jobId)!)),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Retry timed out')), timeout)
        })
      ])
      if (!isReserved(jobId, reservation, activeStatus)) return
      const current = jobFor(jobId)!
      if (step === 'upload') {
        snapshot = {
          activeJobId: jobId,
          jobs: snapshot.jobs.map((candidate) =>
            candidate.jobId === jobId
              ? {
                  ...candidate,
                  status: ASSET_QUEUE_STATUS.PERSISTING,
                  sentBytes: candidate.totalBytes
                }
              : candidate
          )
        }
      } else {
        release(current)
        snapshot = {
          activeJobId: null,
          jobs: snapshot.jobs.map((candidate) =>
            candidate.jobId === jobId
              ? { ...candidate, status: ASSET_QUEUE_STATUS.COMPLETED, preview: null, error: null, failedStep: null }
              : candidate
          )
        }
      }
      notify()
    } catch (error) {
      if (isReserved(jobId, reservation, activeStatus)) {
        snapshot = {
          activeJobId: null,
          jobs: snapshot.jobs.map((candidate) =>
            candidate.jobId === jobId
              ? {
                  ...candidate,
                  status: ASSET_QUEUE_STATUS.FAILED,
                  error: error instanceof Error ? error.message : 'Retry failed',
                  failedStep: step
                }
              : candidate
          )
        }
        notify()
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      if (reservations.get(jobId)?.token === reservation.token) {
        reservations.delete(jobId)
      }
    }
  }

  // Unified guard: returns the job or undefined. Throws when the jobId was
  // never created (prevents programming errors). Silently returns undefined
  // when the job was removed (allows late-callback immunity).
  const locate = (jobId: string): AssetQueueJob | undefined => {
    const job = jobFor(jobId)
    if (job) return job
    if (knownJobIds.has(jobId)) return undefined // removed — late callback
    throw new Error('Illegal asset queue transition')
  }

  return {
    enqueue(target, entityId, preparedAsset, preview) {
      const generationKey = generationKeyFor(target, entityId)
      generations.set(generationKey, (generations.get(generationKey) ?? 0) + 1)
      for (const [jobId, reservation] of reservations) {
        if (reservation.generationKey === generationKey) reservations.delete(jobId)
      }
      // Generation race — auto-cancel only a replacement for the same target/entity.
      const existing = snapshot.jobs.find(
        (j) =>
          j.target === target &&
          j.entityId === entityId &&
          !TERMINAL.has(j.status)
      )
      if (existing) {
        release(existing)
        snapshot = {
          activeJobId:
            snapshot.activeJobId === existing.jobId
              ? null
              : snapshot.activeJobId,
          jobs: snapshot.jobs.map((j) =>
            j.jobId === existing.jobId
              ? { ...j, status: ASSET_QUEUE_STATUS.CANCELLED, preview: null }
              : j
          )
        }
      }

      const job: AssetQueueJob = {
        jobId: `job-${createId()}`,
        target,
        entityId,
        preparedAsset,
        preview: preview ?? null,
        status: ASSET_QUEUE_STATUS.ENQUEUED,
        sentBytes: 0,
        totalBytes: preparedAsset.blob.size,
        error: null,
        failedStep: null
      }
      knownJobIds.add(job.jobId)
      snapshot = { ...snapshot, jobs: [...snapshot.jobs, job] }
      notify()
      return cloneJob(job)
    },

    startUpload(jobId) {
      const job = jobFor(jobId)
      if (
        !job ||
        job.status !== ASSET_QUEUE_STATUS.ENQUEUED ||
        snapshot.activeJobId !== null
      )
        throw new Error('Illegal asset queue transition')
      snapshot = {
        activeJobId: jobId,
        jobs: snapshot.jobs.map((j) =>
          j.jobId === jobId ? { ...j, status: ASSET_QUEUE_STATUS.UPLOADING } : j
        )
      }
      notify()
    },

    setProgress(jobId, sentBytes) {
      const job = locate(jobId)
      if (!job) return // late callback after removal
      if (job.status !== ASSET_QUEUE_STATUS.UPLOADING)
        throw new Error('Illegal asset queue transition')
      if (!Number.isFinite(sentBytes))
        throw new Error('Progress must be finite')
      const clamped = Math.max(0, Math.min(sentBytes, job.totalBytes))
      const next = Math.max(job.sentBytes, clamped)
      snapshot = {
        activeJobId: snapshot.activeJobId,
        jobs: snapshot.jobs.map((j) =>
          j.jobId === jobId ? { ...j, sentBytes: next } : j
        )
      }
      notify()
    },

    completeUpload(jobId) {
      const job = locate(jobId)
      if (!job) return
      if (job.status !== ASSET_QUEUE_STATUS.UPLOADING)
        throw new Error('Illegal asset queue transition')
      snapshot = {
        activeJobId: jobId,
        jobs: snapshot.jobs.map((j) =>
          j.jobId === jobId
            ? {
                ...j,
                status: ASSET_QUEUE_STATUS.PERSISTING,
                sentBytes: j.totalBytes
              }
            : j
        )
      }
      notify()
    },

    completePersistence(jobId) {
      const job = locate(jobId)
      if (!job) return
      if (job.status !== ASSET_QUEUE_STATUS.PERSISTING)
        throw new Error('Illegal asset queue transition')
      release(job)
      snapshot = {
        activeJobId:
          snapshot.activeJobId === jobId ? null : snapshot.activeJobId,
        jobs: snapshot.jobs.map((j) =>
          j.jobId === jobId
            ? { ...j, status: ASSET_QUEUE_STATUS.COMPLETED, preview: null }
            : j
        )
      }
      notify()
    },

    fail(jobId, error) {
      const job = locate(jobId)
      if (!job) return
      if (
        job.status !== ASSET_QUEUE_STATUS.UPLOADING &&
        job.status !== ASSET_QUEUE_STATUS.PERSISTING
      )
        throw new Error('Illegal asset queue transition')
      const failedStep = job.status === ASSET_QUEUE_STATUS.UPLOADING
        ? 'upload'
        : 'persist'
      snapshot = {
        activeJobId:
          snapshot.activeJobId === jobId ? null : snapshot.activeJobId,
        jobs: snapshot.jobs.map((j) =>
          j.jobId === jobId
            ? { ...j, status: ASSET_QUEUE_STATUS.FAILED, error, failedStep }
            : j
        )
      }
      notify()
    },

    retryUpload(jobId) {
      return retry(jobId, 'upload')
    },

    retryPersistence(jobId) {
      return retry(jobId, 'persist')
    },

    cancel(jobId) {
      const job = locate(jobId)
      if (!job) return
      if (
        job.status !== ASSET_QUEUE_STATUS.ENQUEUED &&
        job.status !== ASSET_QUEUE_STATUS.UPLOADING &&
        job.status !== ASSET_QUEUE_STATUS.PERSISTING
      )
        throw new Error('Illegal asset queue transition')
      release(job)
      snapshot = {
        activeJobId:
          snapshot.activeJobId === jobId ? null : snapshot.activeJobId,
        jobs: snapshot.jobs.map((j) =>
          j.jobId === jobId
            ? { ...j, status: ASSET_QUEUE_STATUS.CANCELLED, preview: null }
            : j
        )
      }
      notify()
    },

    remove(jobId) {
      const job = jobFor(jobId)
      if (!job) throw new Error('Unknown asset queue job')
      release(job)
      snapshot = {
        activeJobId:
          snapshot.activeJobId === jobId ? null : snapshot.activeJobId,
        jobs: snapshot.jobs.filter((j) => j.jobId !== jobId)
      }
      notify()
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    getSnapshot() {
      return { ...snapshot, jobs: snapshot.jobs.map(cloneJob) }
    }
  }
}
