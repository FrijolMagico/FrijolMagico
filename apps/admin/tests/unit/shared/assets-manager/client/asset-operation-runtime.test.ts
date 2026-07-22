import { describe, expect, test } from 'bun:test'

import type { AssetOperationPolicy } from '../../../../../src/shared/assets-manager/client/asset-operation-contracts'
import { createAssetOperationRuntime } from '../../../../../src/shared/assets-manager/client/asset-operation-runtime'
import { ASSET_TARGET } from '../../../../../src/shared/assets-manager/client/contracts'
import {
  createAssetQueue,
  type AssetQueueOperations
} from '../../../../../src/shared/assets-manager/client/queue'

const preparedAsset = {
  blob: new Blob(['data'], { type: 'image/webp' }),
  width: 800,
  height: 800,
  mimeType: 'image/webp' as const
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })
  return { promise, resolve }
}

async function waitUntil(
  condition: () => boolean,
  subscribe: (listener: () => void) => () => void
) {
  if (condition()) return
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe()
      reject(new Error('Condition was not reached'))
    }, 250)
    const unsubscribe = subscribe(() => {
      if (!condition()) return
      clearTimeout(timeout)
      unsubscribe()
      resolve()
    })
  })
}

function createHarness(timeout = 100) {
  let id = 0
  const operations: AssetQueueOperations = {
    upload: async () => {},
    persist: async () => {}
  }
  const queue = createAssetQueue(() => `id-${++id}`, operations, {
    baseDelay: 0,
    timeout
  })
  const runtime = createAssetOperationRuntime(
    queue,
    (registered) => Object.assign(operations, registered),
    () => `correlation-${++id}`,
    timeout
  )
  return { runtime, queue }
}

function policy(
  events: string[],
  overrides: Partial<AssetOperationPolicy<string, string, string | null>> = {}
): AssetOperationPolicy<string, string, string | null> {
  return {
    upload: async ({ context, preparedAsset: asset }) => {
      events.push(`upload:${context.target}:${asset.blob.size}`)
      context.reportProgress(asset.blob.size)
      return 'upload'
    },
    persist: async ({ upload }) => {
      events.push(`persist:${upload}`)
      return { persisted: 'persisted', cleanup: 'cleanup' }
    },
    cleanup: async ({ value }) => {
      events.push(`cleanup:${value}`)
    },
    ...overrides
  }
}

type LatePersistence = { persisted: string; cleanup: string }
function latePersistencePolicy(
  pending: Promise<LatePersistence>,
  cleanups: string[]
) {
  let first = true
  return policy([], {
    persist: () => {
      if (first) {
        first = false
        return pending
      }
      return Promise.resolve({ persisted: 'saved', cleanup: null })
    },
    cleanup: async ({ value }) => {
      if (value) cleanups.push(value)
    }
  })
}
async function runLatePersistenceScenario(
  action: 'cancel' | 'remove' | 'replace'
) {
  const { runtime, queue } = createHarness()
  const pending = deferred<LatePersistence>()
  const cleanups: string[] = []
  runtime.register(
    ASSET_TARGET.ARTIST_AVATAR,
    latePersistencePolicy(pending.promise, cleanups)
  )
  const entityId = action === 'replace' ? 'replaced' : action
  const first = runtime.enqueue(
    ASSET_TARGET.ARTIST_AVATAR,
    entityId,
    preparedAsset
  )
  await waitUntil(
    () => queue.getSnapshot().jobs[0]?.status === 'persisting',
    queue.subscribe
  )
  if (action === 'replace') {
    const replacement = runtime.enqueue(ASSET_TARGET.ARTIST_AVATAR, entityId, {
      ...preparedAsset,
      width: 900
    })
    pending.resolve({ persisted: 'late', cleanup: 'old-asset' })
    await settled(queue, replacement.jobId)
    expect(queue.getSnapshot().jobs.map((job) => job.status)).toEqual([
      'cancelled',
      'completed'
    ])
  } else {
    runtime[action](first.jobId)
    pending.resolve({ persisted: 'late', cleanup: 'old-asset' })
    await Bun.sleep(0)
    if (action === 'cancel')
      expect(queue.getSnapshot().jobs[0]?.status).toBe('cancelled')
    else expect(queue.getSnapshot().jobs).toHaveLength(0)
  }
  await runtime.retryCleanup(first.jobId)
}
const settled = (queue: ReturnType<typeof createAssetQueue>, jobId: string) =>
  waitUntil(
    () =>
      ['completed', 'failed', 'cancelled'].includes(
        queue.getSnapshot().jobs.find((job) => job.jobId === jobId)?.status ??
          ''
      ),
    queue.subscribe
  )

describe('asset operation runtime', () => {
  test('passes prepared assets through upload, persists, then cleans once after completion', async () => {
    const { runtime, queue } = createHarness()
    const events: string[] = []
    runtime.register(ASSET_TARGET.ARTIST_AVATAR, policy(events))

    const job = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'artist-1',
      preparedAsset
    )
    await settled(queue, job.jobId)

    expect(queue.getSnapshot().jobs[0]?.status).toBe('completed')
    expect(events).toEqual([
      'upload:artist-avatar:4',
      'persist:upload',
      'cleanup:cleanup'
    ])
    runtime.cancel(job.jobId)
    expect(events).toHaveLength(3)
  })

  test('keeps a failed job retryable when cancel is requested', async () => {
    const { runtime, queue } = createHarness()
    let uploads = 0
    runtime.register(
      ASSET_TARGET.ARTIST_AVATAR,
      policy([], {
        upload: async () => {
          uploads++
          if (uploads === 1) throw new Error('upload failed')
          return 'uploaded'
        }
      })
    )
    const job = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'failed-cancel',
      preparedAsset
    )
    await settled(queue, job.jobId)
    expect(() => runtime.cancel(job.jobId)).not.toThrow()
    await runtime.retryUpload(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.status).toBe('completed')
  })
  test('keeps equal IDs independent across targets and aborts a replaced target before its generation advances', async () => {
    const { runtime, queue } = createHarness()
    const firstUpload = deferred<string>()
    let aborted = false
    runtime.register(
      ASSET_TARGET.ARTIST_AVATAR,
      policy([], {
        upload: ({ context, preparedAsset: asset }) => {
          context.signal.addEventListener('abort', () => {
            aborted = true
          })
          return asset === preparedAsset
            ? firstUpload.promise
            : Promise.resolve('replacement')
        }
      })
    )
    runtime.register(ASSET_TARGET.EDITION_POSTER, policy([]))

    const first = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'same',
      preparedAsset
    )
    await waitUntil(
      () => queue.getSnapshot().activeJobId === first.jobId,
      queue.subscribe
    )
    const poster = runtime.enqueue(
      ASSET_TARGET.EDITION_POSTER,
      'same',
      preparedAsset
    )
    const replacement = runtime.enqueue(ASSET_TARGET.ARTIST_AVATAR, 'same', {
      ...preparedAsset,
      width: 900
    })
    firstUpload.resolve('late')
    await Promise.all([
      settled(queue, poster.jobId),
      settled(queue, replacement.jobId)
    ])

    expect(aborted).toBe(true)
    expect(queue.getSnapshot().jobs.map((job) => job.status)).toEqual([
      'cancelled',
      'completed',
      'completed'
    ])
  })

  test('releases serialized work after timeout and ignores late upload results', async () => {
    const { runtime, queue } = createHarness(10)
    const hung = deferred<string>()
    let persisted = 0
    runtime.register(
      ASSET_TARGET.ARTIST_AVATAR,
      policy([], {
        upload: ({ context }) =>
          context.entityId === 'first'
            ? hung.promise
            : Promise.resolve('second'),
        persist: async () => {
          persisted++
          return { persisted: 'saved', cleanup: null }
        }
      })
    )

    const first = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'first',
      preparedAsset
    )
    const second = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'second',
      preparedAsset
    )
    await Promise.all([
      settled(queue, first.jobId),
      settled(queue, second.jobId)
    ])
    hung.resolve('late')

    expect(queue.getSnapshot().jobs.map((job) => job.status)).toEqual([
      'failed',
      'completed'
    ])
    expect(queue.getSnapshot().jobs[0]?.error).toBe('Asset operation timed out')
    expect(persisted).toBe(1)
  })

  test('retries upload by reuploading and retries persistence without another upload', async () => {
    const { runtime, queue } = createHarness()
    let uploads = 0
    let persists = 0
    runtime.register(
      ASSET_TARGET.ARTIST_AVATAR,
      policy([], {
        upload: async () => {
          uploads++
          if (uploads === 1) throw new Error('upload')
          return 'uploaded'
        },
        persist: async () => {
          persists++
          if (persists === 1) throw new Error('persist')
          return { persisted: 'saved', cleanup: null }
        }
      })
    )

    const job = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'retry',
      preparedAsset
    )
    await settled(queue, job.jobId)
    expect(queue.getSnapshot().jobs[0]?.failedStep).toBe('upload')
    await runtime.retryUpload(job.jobId)
    expect(queue.getSnapshot().jobs[0]?.failedStep).toBe('persist')
    await runtime.retryPersistence(job.jobId)

    expect(queue.getSnapshot().jobs[0]?.status).toBe('completed')
    expect(uploads).toBe(2)
    expect(persists).toBe(2)
  })

  test('keeps an upload retry queued behind active work instead of discarding it', async () => {
    const { runtime, queue } = createHarness()
    const activeUpload = deferred<string>()
    let retryUploads = 0
    runtime.register(
      ASSET_TARGET.ARTIST_AVATAR,
      policy([], {
        upload: async ({ context }) => {
          if (context.entityId === 'active') return activeUpload.promise
          retryUploads++
          if (retryUploads === 1) throw new Error('initial upload failed')
          return 'retried'
        },
        persist: async () => ({ persisted: 'saved', cleanup: null })
      })
    )

    const failed = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'retry',
      preparedAsset
    )
    await settled(queue, failed.jobId)
    const active = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'active',
      preparedAsset
    )
    await waitUntil(
      () => queue.getSnapshot().activeJobId === active.jobId,
      queue.subscribe
    )
    const retry = runtime.retryUpload(failed.jobId)
    activeUpload.resolve('active')
    await retry

    expect(retryUploads).toBe(2)
    expect(queue.getSnapshot().jobs[0]?.status).toBe('completed')
    expect(queue.getSnapshot().jobs[1]?.status).toBe('completed')
  })

  test('guards active cancel, remove, and replacement from late persistence results', async () => {
    await runLatePersistenceScenario('cancel')
    await runLatePersistenceScenario('remove')
    await runLatePersistenceScenario('replace')
  })
  test('keeps cleanup failures observable and non-fatal', async () => {
    const { runtime, queue } = createHarness()
    const failures: string[] = []
    let cleanupAttempts = 0
    runtime.register(
      ASSET_TARGET.ARTIST_AVATAR,
      policy([], {
        cleanup: async () => {
          cleanupAttempts++
          if (cleanupAttempts === 1) throw new Error('cleanup unavailable')
        }
      })
    )
    runtime.subscribeCleanupFailures(() => {
      throw new Error('listener failed')
    })
    runtime.subscribeCleanupFailures((failure) => failures.push(failure.error))

    const job = runtime.enqueue(
      ASSET_TARGET.ARTIST_AVATAR,
      'cleanup',
      preparedAsset
    )
    await settled(queue, job.jobId)
    await waitUntil(
      () => runtime.getCleanupFailures().length === 1,
      (listener) => runtime.subscribeCleanupFailures(listener)
    )
    await runtime.retryCleanup(job.jobId)

    expect(queue.getSnapshot().jobs[0]?.status).toBe('completed')
    expect(failures).toEqual(['cleanup unavailable'])
    expect(cleanupAttempts).toBe(2)
  })
})
