import { describe, expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { SharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'
import type { AssetQueueSnapshot, AssetQueueJob } from '@/shared/assets-manager/client/queue'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'

const refresh = mock(() => {})

mock.module('next/navigation', () => ({
  useRouter: () => ({ refresh }),
  redirect: mock(() => {}),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const preparedAsset = {
  blob: new Blob(['data'], { type: 'image/webp' }),
  width: 800,
  height: 600,
  mimeType: 'image/webp' as const,
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
    ...overrides,
  }
}

type Listener = (state: AssetQueueSnapshot) => void

/** Build a minimal mock store that satisfies the slice of SharedAssetQueueStore
 * the QueueFloatBar component uses. */
function createMockStore(
  snapshot: AssetQueueSnapshot,
): SharedAssetQueueStore {
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
    retryPersistence: mock(() => Promise.resolve()),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('QueueFloatBar', () => {
  // 1 — hidden states
  test('1a: hides when store has no jobs', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const mockStore = createMockStore({ jobs: [], activeJobId: null })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )
    expect(markup).toBe('')
  })

  test('1b: hides when all jobs are terminal (completed, cancelled)', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const completed = createJob({
      status: ASSET_QUEUE_STATUS.COMPLETED,
    })
    const cancelled = createJob({
      status: ASSET_QUEUE_STATUS.CANCELLED,
    })
    const mockStore = createMockStore({
      jobs: [completed, cancelled],
      activeJobId: null,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )
    expect(markup).toBe('')
  })

  // 2 — progress states
  test('2a: shows progress bar + bytes during upload', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.UPLOADING,
      sentBytes: 1024,
      totalBytes: 4096,
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )

    expect(markup).not.toBe('')
    expect(markup).toContain('Subiendo')
    expect(markup).toContain('Cancelar')
    expect(markup).toContain('data-slot="progress"')
  })

  test('2b: shows progress bar during persistence', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.PERSISTING,
      sentBytes: 4096,
      totalBytes: 4096,
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )
    expect(markup).not.toBe('')
    expect(markup).toContain('Persistiendo')
    expect(markup).toContain('Cancelar')
  })

  // 3 — failed states
  test('3a: shows error + Retry + Cancel on upload failure', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      error: 'Network error',
      failedStep: 'upload',
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: null,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )

    expect(markup).not.toBe('')
    expect(markup).toContain('Network error')
    expect(markup).toContain('Reintentar')
    expect(markup).toContain('Cancelar')
  })

  test('3b: shows error + Retry + Cancel on persist failure', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      error: 'DB error',
      failedStep: 'persist',
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: null,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )

    expect(markup).toContain('DB error')
    expect(markup).toContain('Reintentar')
    expect(markup).toContain('Cancelar')
  })

  test('3c: identifies an avatar conflict and offers Refresh instead of retrying', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      error: 'AVATAR_CONFLICT',
      failedStep: 'persist',
    })
    const mockStore = createMockStore({ jobs: [job], activeJobId: null })

    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )

    expect(markup).toContain('El avatar cambió en otra sesión.')
    expect(markup).toContain('Actualizar')
    expect(markup).toContain('Cancelar')
    expect(markup).not.toContain('Reintentar')
  })

  // 4 — cancelling state
  test('4: shows Cancelando + spinner during cancelling state', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.UPLOADING,
      sentBytes: 2048,
      totalBytes: 4096,
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId,
    })

    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, {
        store: mockStore,
        cancellingJobId: job.jobId,
      }),
    )

    expect(markup).toContain('Cancelando')
  })

  // 5 — enqueued state
  test('5: shows En cola + Cancel for enqueued job with activeJobId', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.ENQUEUED,
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )

    expect(markup).toContain('En cola')
    expect(markup).toContain(job.target)
    expect(markup).toContain('Cancelar')
  })

  test('6: shows En cola + Cancel for enqueued job without activeJobId', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const completed = createJob({
      status: ASSET_QUEUE_STATUS.COMPLETED,
    })
    const enqueued = createJob({
      status: ASSET_QUEUE_STATUS.ENQUEUED,
    })
    const mockStore = createMockStore({
      jobs: [completed, enqueued],
      activeJobId: null,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )

    expect(markup).toContain('En cola')
    expect(markup).toContain('Cancelar')
  })

  // 7 — Cancel button rendering
  test('7a: renders Cancel button for uploading job', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.UPLOADING,
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )
    expect(markup).toContain('Cancelar')
  })

  test('7b: renders Cancel button for enqueued job', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.ENQUEUED,
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: job.jobId,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )
    expect(markup).toContain('Cancelar')
  })

  test('7c: renders Cancel button for failed job', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      failedStep: 'upload',
      error: 'error',
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: null,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )
    expect(markup).toContain('Cancelar')
  })

  // 8 — Retry button rendering
  test('8a: renders Retry button for upload failure', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      error: 'Upload failed',
      failedStep: 'upload',
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: null,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )
    expect(markup).toContain('Reintentar')
  })

  test('8b: renders Retry button for persist failure', async () => {
    const { QueueFloatBar } = await import(
      '@/shared/components/queue-float-bar'
    )
    const job = createJob({
      status: ASSET_QUEUE_STATUS.FAILED,
      error: 'Persist failed',
      failedStep: 'persist',
    })
    const mockStore = createMockStore({
      jobs: [job],
      activeJobId: null,
    })
    const markup = renderToStaticMarkup(
      createElement(QueueFloatBar, { store: mockStore }),
    )
    expect(markup).toContain('Reintentar')
  })
})
