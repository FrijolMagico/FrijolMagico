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
  _operations?: AssetQueueOperations
): AssetQueue {
  void _operations // stored for external retry orchestration (#97)
  let snapshot: AssetQueueSnapshot = { jobs: [], activeJobId: null }
  const knownJobIds = new Set<string>()
  const listeners = new Set<Listener>()

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
      // Generation race — auto-cancel any non-terminal job with same entityId
      const existing = snapshot.jobs.find(
        (j) => j.entityId === entityId && !TERMINAL.has(j.status)
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
        (snapshot.activeJobId !== null && snapshot.activeJobId !== jobId)
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
