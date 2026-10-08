import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'

import type { AssetQueueSnapshot } from '@/shared/assets-manager/client/queue'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'
import { createHappyDOMEnvironment } from '@/tests/unit/_support/happy-dom-environment'

const environment = await createHappyDOMEnvironment()
const { createRoot } = await import('react-dom/client')
const activeRoots = new Set<ReturnType<typeof createRoot>>()

afterEach(async () => {
  try {
    for (const root of activeRoots) await act(async () => root.unmount())
  } finally {
    activeRoots.clear()
    document.body.replaceChildren()
  }
})

afterAll(async () => environment.dispose())

const refresh = mock(() => {})
let snapshot: AssetQueueSnapshot
const listeners = new Set<(next: AssetQueueSnapshot) => void>()
const store = {
  getState: () => snapshot,
  subscribe: (listener: (next: AssetQueueSnapshot) => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
}

mock.module('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
mock.module('@/shared/assets-manager/client/shared-asset-queue', () => ({
  getSharedAssetQueueStore: () => store
}))


const { useCatalogAvatarCompletionRefresh } = await import('@/core/artistas/catalogo/_hooks/use-catalog-avatar-completion-refresh')

test('the rendered completion-refresh hook refreshes once after exact persistence completes', async () => {
  const job = { jobId: 'exact', target: 'artist-avatar' as const, entityId: '42', preparedAsset: { blob: new Blob(), width: 1, height: 1, mimeType: 'image/webp' as const }, preview: null, status: ASSET_QUEUE_STATUS.PERSISTING, sentBytes: 0, totalBytes: 0, error: null, failedStep: null }
  snapshot = { jobs: [job], activeJobId: job.jobId }
  refresh.mockClear()
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  activeRoots.add(root)
  function Probe() { useCatalogAvatarCompletionRefresh(42); return null }
  await act(async () => { root.render(createElement(Probe)) })
  await act(async () => {
    snapshot = { jobs: [{ ...job, status: ASSET_QUEUE_STATUS.COMPLETED }], activeJobId: null }
    for (const listener of listeners) listener(snapshot)
  })
  expect(refresh).toHaveBeenCalledTimes(1)
  await act(async () => { root.unmount() })
  activeRoots.delete(root)
  container.remove()
})
