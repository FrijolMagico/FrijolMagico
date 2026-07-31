import { describe, expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { SharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import type {
  AssetQueueSnapshot,
  AssetQueueJob
} from '@/shared/assets-manager/client/queue'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'
import { scheduleSuccessDismissal } from '@/shared/components/queue-float-bar'

const refresh = mock(() => {})

mock.module('next/navigation', () => ({
  useRouter: () => ({ refresh }),
  redirect: mock(() => {})
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const preparedAsset = {
  blob: new Blob(['data'], { type: 'image/webp' }),
  width: 800,
  height: 600,
  mimeType: 'image/webp' as const
}

function createJob(overrides: Partial<AssetQueueJob> = {}): AssetQueueJob {
  return {
    jobId: `job-${crypto.randomUUID()}`,
    target: 'artist-avatar' as const,
    entityId: 'entity-1',
    preparedAsset,
    preview: null,
    status: ASSET_QUEUE_STATUS.ENQUEUED,
    sentBytes: 0,
    totalBytes: 4096,
    error: null,
    failedStep: null,
    ...overrides
  }
}

type Listener = (state: AssetQueueSnapshot) => void

/** Build a minimal mock store that satisfies the slice of SharedAssetQueueStore
 * the QueueFloatBar component uses. */
function createMockStore(snapshot: AssetQueueSnapshot): SharedAssetQueueStore {
  const listeners = new Set<Listener>()

  return {
    getState: () => snapshot,
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    cancel: mock(() => {}),
    remove: mock(() => {}),
    retryUpload: mock(() => Promise.resolve()),
    retryPersistence: mock(() => Promise.resolve())
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('QueueFloatBar', () => {
  test('dismisses a successful queue after exactly 2.5 seconds', () => {
    const delays: number[] = []
    let dismiss: (() => void) | null = null
    const setTimer = (callback: () => void, delay: number) => {
      delays.push(delay)
      dismiss = callback
      return 0 as unknown as number
    }
    let dismissedJobId: string | null = null

    scheduleSuccessDismissal('completed-job', setTimer, (jobId) => {
      dismissedJobId = jobId
    })

    expect(delays).toEqual([2_500])
    expect(dismissedJobId).toBeNull()
    dismiss?.()
    expect(dismissedJobId).toBe('completed-job')
  })

  // 1 — hidden states
  test('1a: hides when store has no jobs', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const mockStore = createMockStore({ jobs: [], activeJobId: null })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )
    expect(markup).toBe('')
  })

  test('1b: shows brief success when the latest job completed', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const completed = createJob({
      status: ASSET_QUEUE_STATUS.COMPLETED
    })
    const cancelled = createJob({
      status: ASSET_QUEUE_STATUS.CANCELLED
    })
    const mockStore = createMockStore({
      jobs: [completed, cancelled],
      activeJobId: null
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )
    expect(markup).toContain('Avatar actualizado')
  })

  // 2 — progress states
  test('2a: shows staged upload state and file size during upload', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({
      status: ASSET_QUEUE_STATUS.UPLOADING,
      sentBytes: 1024,
      totalBytes: 4096
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )

    expect(markup).not.toBe('')
    expect(markup).toContain('Subiendo')
    expect(markup).toContain('Cancelar')
    expect(markup).toContain('4.0 KB')
  })

  test('2b: shows progress bar during persistence', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({
      status: ASSET_QUEUE_STATUS.PERSISTING,
      sentBytes: 4096,
      totalBytes: 4096
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )
    expect(markup).not.toBe('')
    expect(markup).toContain('Persistiendo')
    expect(markup).toContain('Cancelar')
  })

  test('2c: shows the truthful three-stage sequence and marks persistence active', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({
      status: ASSET_QUEUE_STATUS.PERSISTING,
      sentBytes: 4096,
      totalBytes: 4096
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, {
        store: createMockStore({ jobs: [job], activeJobId: job.jobId })
      })
    )

    expect(markup).toContain('En cola')
    expect(markup).toContain('Subiendo')
    expect(markup).toContain('Persistiendo')
    expect(markup).toContain('data-stage-state="completed"')
    expect(markup).toContain('data-stage-state="active"')
    expect(markup).toContain('4.0 KB')
  })

  test('2d: briefly shows completed success as all-green stages before dismissal', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({ status: ASSET_QUEUE_STATUS.COMPLETED })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, {
        store: createMockStore({ jobs: [job], activeJobId: null })
      })
    )

    expect(markup).toContain('Avatar actualizado')
    expect(markup.match(/data-stage-state="completed"/g)?.length).toBe(3)
  })

  // 3 — failed states
  test('3a: shows error + Retry + Cancel on upload failure', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      error: 'Network error',
      failedStep: 'upload'
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: null
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )

    expect(markup).not.toBe('')
    expect(markup).toContain('Network error')
    expect(markup).toContain('Reintentar')
    expect(markup).toContain('Cancelar')
  })

  test('3b: shows error + Retry + Cancel on persist failure', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      error: 'DB error',
      failedStep: 'persist'
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: null
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )

    expect(markup).toContain('DB error')
    expect(markup).toContain('Reintentar')
    expect(markup).toContain('Cancelar')
  })

  test('3c: identifies an avatar conflict and offers Refresh instead of retrying', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      error: 'AVATAR_CONFLICT',
      failedStep: 'persist'
    })
    const mockStore = createMockStore({ jobs: [job], activeJobId: null })

    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )

    expect(markup).toContain('El avatar cambió en otra sesión.')
    expect(markup).toContain('Actualizar')
    expect(markup).toContain('Cancelar')
    expect(markup).not.toContain('Reintentar')
  })

  // 4 — cancelling state
  test('4: shows Cancelando + spinner during cancelling state', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({
      status: ASSET_QUEUE_STATUS.UPLOADING,
      sentBytes: 2048,
      totalBytes: 4096
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId
    })

    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, {
        store: mockStore,
        cancellingJobId: job.jobId
      })
    )

    expect(markup).toContain('Cancelando')
  })

  // 5 — enqueued state
  test('5: shows En cola + Cancel for enqueued job with activeJobId', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const job = createJob({
      status: ASSET_QUEUE_STATUS.ENQUEUED
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )

    expect(markup).toContain('En cola')
    expect(markup).toContain(job.target)
    expect(markup).toContain('Cancelar')
  })

  test('6: shows En cola + Cancel for enqueued job without activeJobId', async () => {
    const { QueueFloatBar } =
      await import('@/shared/components/queue-float-bar')
    const completed = createJob({
      status: ASSET_QUEUE_STATUS.COMPLETED
    })
    const enqueued = createJob({
      status: ASSET_QUEUE_STATUS.ENQUEUED
    })
    const mockStore = createMockStore({
      jobs: [completed, enqueued],
      activeJobId: null
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore })
    )

    expect(markup).toContain('En cola')
    expect(markup).toContain('Cancelar')
  })
})
