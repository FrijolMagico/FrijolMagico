import { describe, expect, mock, test } from 'bun:test'

import { ASSET_TARGET } from '../../../../../src/shared/assets-manager/client/contracts'
import type { LocalPreviewHandle } from '../../../../../src/shared/assets-manager/client/contracts'
import {
  createAssetQueue,
  ASSET_QUEUE_STATUS
} from '../../../../../src/shared/assets-manager/client/queue'
import type {
  AssetQueueJob,
  AssetQueueOperations
} from '../../../../../src/shared/assets-manager/client/queue'

const preparedAsset = {
  blob: new Blob(['data'], { type: 'image/webp' }),
  width: 800,
  height: 600,
  mimeType: 'image/webp' as const
}

function createQueue(
  operations?: Partial<AssetQueueOperations>,
  retryOptions?: { baseDelay?: number; timeout?: number; maxRetries?: number }
) {
  return createAssetQueue(() => crypto.randomUUID(), operations, retryOptions)
}

function failedJob(
  queue: ReturnType<typeof createQueue>,
  step: 'upload' | 'persist' = 'upload'
) {
  const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, crypto.randomUUID(), preparedAsset)
  queue.startUpload(job.jobId)
  if (step === 'persist') queue.completeUpload(job.jobId)
  queue.fail(job.jobId, 'failed')
  return job
}

const preview: LocalPreviewHandle = {
  url: 'blob:preview',
  release: () => {}
}

// ---------------------------------------------------------------------------
// 1. Happy path
// ---------------------------------------------------------------------------
describe('happy path', () => {
  test('enqueue → startUpload → completeUpload → completePersistence → completed', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'edition-1', preparedAsset)

    expect(job.status).toBe(ASSET_QUEUE_STATUS.ENQUEUED)
    expect(job.sentBytes).toBe(0)
    expect(job.totalBytes).toBe(preparedAsset.blob.size)
    expect(job.failedStep).toBeNull()
    expect(job.error).toBeNull()

    queue.startUpload(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.UPLOADING)

    queue.completeUpload(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.PERSISTING)
    expect(queue.getSnapshot().jobs[0]?.sentBytes).toBe(preparedAsset.blob.size)

    queue.completePersistence(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.COMPLETED)
    expect(queue.getSnapshot().activeJobId).toBeNull()
  })

  test('enqueue returns a cloned job that cannot mutate queue state', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'edition-1', preparedAsset)
    const originalStatus = job.status

    // Mutate returned job — queue state must NOT change
    const returned = job as AssetQueueJob
    ;(returned.status as string) = ASSET_QUEUE_STATUS.COMPLETED

    expect(queue.getSnapshot().jobs[0]?.status).toBe(originalStatus)
  })
})

// ---------------------------------------------------------------------------
// 2. Transition guards — illegal transitions throw without mutation
// ---------------------------------------------------------------------------
describe('transition guards', () => {
  test('startUpload on a job that does not exist throws', () => {
    const queue = createQueue()
    expect(() => queue.startUpload('nonexistent')).toThrow('Illegal asset queue transition')
  })

  test('startUpload from enqueued with an active job throws', () => {
    const queue = createQueue()
    const job1 = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    const job2 = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e2', preparedAsset)
    queue.startUpload(job1.jobId)

    expect(() => queue.startUpload(job2.jobId)).toThrow('Illegal asset queue transition')
  })

  test('startUpload on a job that is not enqueued throws', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)

    expect(() => queue.startUpload(job.jobId)).toThrow('Illegal asset queue transition')
  })

  test('completeUpload from enqueued throws', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    expect(() => queue.completeUpload(job.jobId)).toThrow('Illegal asset queue transition')
  })

  test('completePersistence from uploading throws', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)

    expect(() => queue.completePersistence(job.jobId)).toThrow('Illegal asset queue transition')
  })

  test('fail from enqueued throws', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    expect(() => queue.fail(job.jobId, 'early error')).toThrow('Illegal asset queue transition')
  })

  test('fail from completed throws', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    queue.completePersistence(job.jobId)

    expect(() => queue.fail(job.jobId, 'too late')).toThrow('Illegal asset queue transition')
  })

  test('cancel from completed throws', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    queue.completePersistence(job.jobId)

    expect(() => queue.cancel(job.jobId)).toThrow('Illegal asset queue transition')
  })

  test('cancel from failed throws', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.fail(job.jobId, 'upload error')

    expect(() => queue.cancel(job.jobId)).toThrow('Illegal asset queue transition')
  })

  test('cancel from cancelled throws', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.cancel(job.jobId)

    expect(() => queue.cancel(job.jobId)).toThrow('Illegal asset queue transition')
  })

  test('illegal transition leaves snapshot unchanged', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    const before = queue.getSnapshot()
    expect(() => queue.completeUpload(job.jobId)).toThrow()
    expect(queue.getSnapshot()).toEqual(before)
  })
})

// ---------------------------------------------------------------------------
// 3. Immutable snapshots
// ---------------------------------------------------------------------------
describe('immutable snapshots', () => {
  test('mutating returned job fields does not affect queue state', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    const mutable = job as AssetQueueJob
    mutable.status = ASSET_QUEUE_STATUS.COMPLETED as typeof job.status

    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.ENQUEUED)
  })

  test('mutating returned snapshot does not affect queue state', () => {
    const queue = createQueue()
    queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    const snapshot = queue.getSnapshot()
    snapshot.activeJobId = 'hacked'
    snapshot.jobs = []

    expect(queue.getSnapshot().activeJobId).toBeNull()
    expect(queue.getSnapshot().jobs).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// 4. Progress tracking
// ---------------------------------------------------------------------------
describe('progress tracking', () => {
  test('setProgress throws for non-finite values', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)

    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => queue.setProgress(job.jobId, value)).toThrow('Progress must be finite')
    }
  })

  test('progress is bounded between 0 and totalBytes', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)

    // Below zero clamps to 0
    queue.setProgress(job.jobId, -100)
    expect(queue.getSnapshot().jobs[0]?.sentBytes).toBe(0)

    // Above totalBytes clamps to totalBytes
    queue.setProgress(job.jobId, preparedAsset.blob.size + 999)
    expect(queue.getSnapshot().jobs[0]?.sentBytes).toBe(preparedAsset.blob.size)
  })

  test('progress is monotonic (never decreases)', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)

    queue.setProgress(job.jobId, 2)
    expect(queue.getSnapshot().jobs[0]?.sentBytes).toBe(2)

    // Attempt to go down — should stay at 2
    queue.setProgress(job.jobId, 1)
    expect(queue.getSnapshot().jobs[0]?.sentBytes).toBe(2)

    // Can still go up (bounded by totalBytes = 4)
    queue.setProgress(job.jobId, 3)
    expect(queue.getSnapshot().jobs[0]?.sentBytes).toBe(3)
  })

  test('setProgress throws when not uploading', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)

    expect(() => queue.setProgress(job.jobId, 10)).toThrow('Illegal asset queue transition')
  })

  test('setProgress on nonexistent job throws', () => {
    const queue = createQueue()
    expect(() => queue.setProgress('nope', 10)).toThrow('Illegal asset queue transition')
  })
})

// ---------------------------------------------------------------------------
// 5. Cancel from each cancellable state
// ---------------------------------------------------------------------------
describe('cancellation', () => {
  test('cancel from enqueued', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.cancel(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.CANCELLED)
  })

  test('cancel from uploading', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.cancel(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.CANCELLED)
  })

  test('cancel from persisting', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    queue.cancel(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.CANCELLED)
  })

  test('cancel removes activeJobId when cancelling the active job', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    expect(queue.getSnapshot().activeJobId).toBe(job.jobId)
    queue.cancel(job.jobId)
    expect(queue.getSnapshot().activeJobId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 6. Generation race cancellation
// ---------------------------------------------------------------------------
describe('generation race', () => {
  test('enqueue with same entityId auto-cancels previous non-terminal job', () => {
    const queue = createQueue()
    const first = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'same-entity', preparedAsset)
    const second = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'same-entity', preparedAsset)

    const jobs = queue.getSnapshot().jobs
    expect(jobs).toHaveLength(2)
    expect(jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.CANCELLED)
    expect(jobs[1]?.status).toBe(ASSET_QUEUE_STATUS.ENQUEUED)
  })

  test('enqueue with same entityId does not cancel terminal jobs', () => {
    const queue = createQueue()
    const first = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'same-entity', preparedAsset)
    queue.startUpload(first.jobId)
    queue.completeUpload(first.jobId)
    queue.completePersistence(first.jobId)

    // First job is completed — enqueue again should not cancel it
    const second = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'same-entity', preparedAsset)
    const jobs = queue.getSnapshot().jobs
    expect(jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.COMPLETED)
    expect(jobs[1]?.status).toBe(ASSET_QUEUE_STATUS.ENQUEUED)
  })

  test('generation race releases preview of cancelled job', () => {
    let releases = 0
    const queue = createQueue()
    queue.enqueue(
      ASSET_TARGET.EDITION_POSTER,
      'same-entity',
      preparedAsset,
      {
        url: 'blob:first',
        release: () => { releases++ }
      }
    )
    queue.enqueue(
      ASSET_TARGET.EDITION_POSTER,
      'same-entity',
      preparedAsset,
      { url: 'blob:second', release: () => {} }
    )

    expect(releases).toBe(1)
  })

  test('generation race clears activeJobId when cancelling the active job', () => {
    const queue = createQueue()
    const first = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'same-entity', preparedAsset)
    queue.startUpload(first.jobId)
    expect(queue.getSnapshot().activeJobId).toBe(first.jobId)

    const second = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'same-entity', preparedAsset)
    expect(queue.getSnapshot().activeJobId).toBeNull()
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.CANCELLED)
    expect(queue.getSnapshot().jobs[1]?.status).toBe(ASSET_QUEUE_STATUS.ENQUEUED)
  })
})

// ---------------------------------------------------------------------------
// 7. Preview lifecycle — released exactly once
// ---------------------------------------------------------------------------
describe('preview release', () => {
  function trackPreview(): LocalPreviewHandle & { count: number } {
    let count = 0
    return { url: 'blob:track', release: () => { count++ }, get count() { return count } }
  }

  test('preview released on completePersistence', () => {
    const queue = createQueue()
    const pv = trackPreview()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset, pv)
    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    queue.completePersistence(job.jobId)
    expect(pv.count).toBe(1)
  })

  test('preview released on cancel', () => {
    const queue = createQueue()
    const pv = trackPreview()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset, pv)
    queue.cancel(job.jobId)
    expect(pv.count).toBe(1)
  })

  test('preview released once on remove', () => {
    const queue = createQueue()
    const pv = trackPreview()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset, pv)
    queue.remove(job.jobId)
    expect(pv.count).toBe(1)

    // remove on already-removed job throws
    expect(() => queue.remove(job.jobId)).toThrow('Unknown asset queue job')
  })

  test('preview not released when none provided', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    queue.completePersistence(job.jobId)
    // Should not crash — handled gracefully
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.COMPLETED)
  })
})

// ---------------------------------------------------------------------------
// 8. Late callbacks after removal are ignored
// ---------------------------------------------------------------------------
describe('late callbacks after removal', () => {
  test('transition calls after remove are silently ignored', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.remove(job.jobId)

    // These should not throw and not resurrect the job
    queue.completeUpload(job.jobId)
    queue.fail(job.jobId, 'late')
    expect(queue.getSnapshot().jobs).toHaveLength(0)
  })

  test('setProgress after remove is silently ignored', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.remove(job.jobId)

    queue.setProgress(job.jobId, 100)
    expect(queue.getSnapshot().jobs).toHaveLength(0)
  })

  test('cancel after remove is silently ignored', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.remove(job.jobId)

    queue.cancel(job.jobId)
    expect(queue.getSnapshot().jobs).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 9. Subscribe / unsubscribe lifecycle
// ---------------------------------------------------------------------------
describe('subscribe / notify', () => {
  test('listener is called on state changes', () => {
    const queue = createQueue()
    let calls = 0
    queue.subscribe(() => { calls++ })
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    expect(calls).toBe(1)
  })

  test('unsubscribed listener is not called', () => {
    const queue = createQueue()
    let calls = 0
    const unsubscribe = queue.subscribe(() => { calls++ })
    unsubscribe()
    queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    expect(calls).toBe(0)
  })

  test('multiple listeners are all called', () => {
    const queue = createQueue()
    let a = 0
    let b = 0
    queue.subscribe(() => { a++ })
    queue.subscribe(() => { b++ })
    queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    expect(a).toBe(1)
    expect(b).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// 10. Inert callbacks — never auto-called by the queue
// ---------------------------------------------------------------------------
describe('inert callbacks', () => {
  test('upload and persist callbacks are never auto-called', () => {
    let uploadCalled = false
    let persistCalled = false
    const queue = createAssetQueue(
      () => crypto.randomUUID(),
      {
        upload: async () => { uploadCalled = true },
        persist: async () => { persistCalled = true }
      }
    )

    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    queue.completePersistence(job.jobId)

    // Callbacks are inert — the queue never calls them
    expect(uploadCalled).toBe(false)
    expect(persistCalled).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 11. fail() sets failedStep correctly
// ---------------------------------------------------------------------------
describe('fail states', () => {
  test('fail during upload sets failedStep to upload and clears activeJobId', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    expect(queue.getSnapshot().activeJobId).toBe(job.jobId)

    queue.fail(job.jobId, 'network error')
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.FAILED)
    expect(queue.getSnapshot().jobs[0]?.failedStep).toBe('upload')
    expect(queue.getSnapshot().jobs[0]?.error).toBe('network error')
    expect(queue.getSnapshot().activeJobId).toBeNull()
  })

  test('fail during persist sets failedStep to persist and clears activeJobId', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    expect(queue.getSnapshot().activeJobId).toBe(job.jobId)

    queue.fail(job.jobId, 'db error')
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.FAILED)
    expect(queue.getSnapshot().jobs[0]?.failedStep).toBe('persist')
    expect(queue.getSnapshot().jobs[0]?.error).toBe('db error')
    expect(queue.getSnapshot().activeJobId).toBeNull()
  })

  test('fail on nonexistent jobId throws', () => {
    const queue = createQueue()
    expect(() => queue.fail('never-existed', 'bad')).toThrow(
      'Illegal asset queue transition'
    )
  })

  test('cancel on nonexistent jobId throws', () => {
    const queue = createQueue()
    expect(() => queue.cancel('never-existed')).toThrow(
      'Illegal asset queue transition'
    )
  })

  test('remove on nonexistent jobId throws', () => {
    const queue = createQueue()
    expect(() => queue.remove('never-existed')).toThrow(
      'Unknown asset queue job'
    )
  })
})

// ---------------------------------------------------------------------------
// 12. Single active job enforcement
// ---------------------------------------------------------------------------
describe('active job', () => {
  test('activeJobId set during upload and cleared on terminal', () => {
    const queue = createQueue()
    const job = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'e1', preparedAsset)
    expect(queue.getSnapshot().activeJobId).toBeNull()

    queue.startUpload(job.jobId)
    expect(queue.getSnapshot().activeJobId).toBe(job.jobId)

    queue.completeUpload(job.jobId)
    expect(queue.getSnapshot().activeJobId).toBe(job.jobId) // still active during persist

    queue.completePersistence(job.jobId)
    expect(queue.getSnapshot().activeJobId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 13. Retry orchestration
// ---------------------------------------------------------------------------
describe('retry orchestration', () => {
  test('retries only the failed operation after restoring its state', async () => {
    let queue = createQueue()
    const upload = mock(async () => {
      expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.UPLOADING)
    })
    const persist = mock(async () => {
      expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.PERSISTING)
    })
    queue = createQueue({ upload, persist }, { baseDelay: 0 })

    const uploadJob = failedJob(queue)
    await queue.retryUpload(uploadJob.jobId)
    expect(upload).toHaveBeenCalledTimes(1)
    expect(persist).not.toHaveBeenCalled()
    queue.completePersistence(uploadJob.jobId)

    const persistJob = failedJob(queue, 'persist')
    await queue.retryPersistence(persistJob.jobId)
    expect(persist).toHaveBeenCalledTimes(1)
    expect(upload).toHaveBeenCalledTimes(1)
  })

  test('preserves failed jobs for invalid retries, occupied slots, and exhausted attempts', async () => {
    const upload = mock(async () => {})
    const queue = createQueue({ upload }, { baseDelay: 0, maxRetries: 1 })
    const job = failedJob(queue)
    const before = queue.getSnapshot()

    await queue.retryPersistence(job.jobId)
    await queue.retryUpload('missing')
    expect(queue.getSnapshot()).toEqual(before)

    const active = queue.enqueue(ASSET_TARGET.EDITION_POSTER, 'active', preparedAsset)
    queue.startUpload(active.jobId)
    await queue.retryUpload(job.jobId)
    queue.fail(active.jobId, 'active failed')
    expect(upload).not.toHaveBeenCalled()

    await queue.retryUpload(job.jobId)
    queue.fail(job.jobId, 'again')
    const exhausted = queue.getSnapshot()
    await queue.retryUpload(job.jobId)
    expect(queue.getSnapshot()).toEqual(exhausted)
    expect(upload).toHaveBeenCalledTimes(1)
  })

  test('invalidates a pending retry when the same entity is replaced', async () => {
    const upload = mock(async () => {})
    const queue = createQueue({ upload }, { baseDelay: 10 })
    const job = failedJob(queue)
    const retry = queue.retryUpload(job.jobId)
    queue.enqueue(ASSET_TARGET.EDITION_POSTER, job.entityId, preparedAsset)
    await retry

    expect(upload).not.toHaveBeenCalled()
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.FAILED)
  })

  test('fails timed-out or rejected retries and ignores late completion and replacement', async () => {
    let resolveUpload!: () => void
    const pending = new Promise<void>((resolve) => { resolveUpload = resolve })
    const queue = createQueue(
      { upload: mock(() => pending), persist: async () => { throw new Error('nope') } },
      { baseDelay: 0, timeout: 5 }
    )
    const job = failedJob(queue)
    await queue.retryUpload(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.failedStep).toBe('upload')

    resolveUpload()
    await Bun.sleep(0)
    expect(queue.getSnapshot().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.FAILED)

    const persistenceJob = failedJob(queue, 'persist')
    await queue.retryPersistence(persistenceJob.jobId)
    expect(queue.getSnapshot().jobs[1]?.failedStep).toBe('persist')

    const replacement = queue.enqueue(ASSET_TARGET.EDITION_POSTER, job.entityId, preparedAsset)
    expect(replacement.status).toBe(ASSET_QUEUE_STATUS.ENQUEUED)
  })

  test('clears residual error and failedStep after a successful upload retry', async () => {
    const queue = createQueue(
      { upload: mock(async () => {}) },
      { baseDelay: 0 }
    )
    const job = failedJob(queue)
    expect(queue.getSnapshot().jobs[0]?.error).toBe('failed')
    expect(queue.getSnapshot().jobs[0]?.failedStep).toBe('upload')

    await queue.retryUpload(job.jobId)
    // After the upload retry, the retry function transitions to PERSISTING internally;
    // the caller must complete persistence externally.
    queue.completePersistence(job.jobId)

    const final = queue.getSnapshot().jobs[0]
    expect(final?.status).toBe(ASSET_QUEUE_STATUS.COMPLETED)
    expect(final?.error).toBeNull()
    expect(final?.failedStep).toBeNull()
  })

  test('clears residual error and failedStep after a successful persist retry', async () => {
    const queue = createQueue(
      { persist: mock(async () => {}) },
      { baseDelay: 0 }
    )
    const job = failedJob(queue, 'persist')
    expect(queue.getSnapshot().jobs[0]?.error).toBe('failed')
    expect(queue.getSnapshot().jobs[0]?.failedStep).toBe('persist')

    await queue.retryPersistence(job.jobId)

    const final = queue.getSnapshot().jobs[0]
    expect(final?.status).toBe(ASSET_QUEUE_STATUS.COMPLETED)
    expect(final?.error).toBeNull()
    expect(final?.failedStep).toBeNull()
  })
})
