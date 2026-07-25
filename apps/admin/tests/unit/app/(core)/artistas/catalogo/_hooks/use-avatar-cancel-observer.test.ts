import { describe, expect, test, mock } from 'bun:test'

import { createAssetQueue } from '@/shared/assets-manager/client/queue'
import { createAssetQueueStore } from '@/shared/assets-manager/client/asset-queue-store'
import { ASSET_TARGET } from '@/shared/assets-manager/client/contracts'
import type { PreparedAsset } from '@/shared/assets-manager/client/contracts'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'

import { createAvatarCancelObserver } from '@/core/artistas/catalogo/_hooks/use-avatar-cancel-observer'

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

function createHarness() {
  const queue = createAssetQueue(() => crypto.randomUUID())
  const store = createAssetQueueStore(queue)
  const onCancel = mock<(artistCatalogId: number) => void>()

  const observer = createAvatarCancelObserver({ store, onCancel })
  const destroy = observer.destroy

  const makePreparedAsset = (): PreparedAsset => ({
    blob: new Blob(['test'], { type: 'image/webp' }),
    width: 800,
    height: 800,
    mimeType: 'image/webp'
  })

  return { queue, store, onCancel, destroy, makePreparedAsset }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ARTIST_AVATAR = ASSET_TARGET.ARTIST_AVATAR
const EDITION_POSTER = ASSET_TARGET.EDITION_POSTER

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createAvatarCancelObserver', () => {
  test('calls onCancel when an artist-avatar job transitions to CANCELLED', () => {
    const { store, onCancel, destroy, makePreparedAsset } = createHarness()
    const asset = makePreparedAsset()

    const job = store.enqueue(ARTIST_AVATAR, '42', asset)
    expect(onCancel).not.toHaveBeenCalled()

    store.cancel(job.jobId)
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onCancel).toHaveBeenCalledWith(42)

    destroy()
  })

  test('does NOT call onCancel when a non-avatar job (edition-poster) is cancelled', () => {
    const { store, onCancel, destroy, makePreparedAsset } = createHarness()
    const asset = makePreparedAsset()

    const job = store.enqueue(EDITION_POSTER, '99', asset)
    store.cancel(job.jobId)

    expect(onCancel).not.toHaveBeenCalled()
    destroy()
  })

  test('does NOT call onCancel when an artist-avatar job completes normally (COMPLETED)', () => {
    const { queue, store, onCancel, destroy, makePreparedAsset } = createHarness()
    const asset = makePreparedAsset()

    const job = store.enqueue(ARTIST_AVATAR, '7', asset)
    queue.startUpload(job.jobId)
    queue.completeUpload(job.jobId)
    queue.completePersistence(job.jobId)

    expect(onCancel).not.toHaveBeenCalled()
    destroy()
  })

  test('does NOT call onCancel on already-cancelled jobs on observer creation', () => {
    const { queue, onCancel, makePreparedAsset } = createHarness()
    const asset = makePreparedAsset()

    // Enqueue, cancel, THEN create observer
    const job = queue.enqueue(ARTIST_AVATAR, '42', asset)
    queue.cancel(job.jobId)

    // Observer starts AFTER cancel — should not call onCancel for pre-existing cancelled jobs
    const store = createAssetQueueStore(queue)
    const onCancelLate = mock<(artistCatalogId: number) => void>()
    createAvatarCancelObserver({ store, onCancel: onCancelLate })

    expect(onCancelLate).not.toHaveBeenCalled()
  })

  test('does NOT double-fire onCancel for the same cancelled job when no new mutations occur', () => {
    const { store, onCancel, destroy, makePreparedAsset } = createHarness()
    const asset = makePreparedAsset()

    const job = store.enqueue(ARTIST_AVATAR, '42', asset)
    store.cancel(job.jobId)

    // After cancel, onCancel was called once
    expect(onCancel).toHaveBeenCalledTimes(1)

    // Observer's listener should not fire again for the same cancelled job
    // unless a new mutation happens. Triggering another unrelated mutation
    // should not double-call for the already-cancelled job.
    const otherAsset = makePreparedAsset()
    const otherJob = store.enqueue(EDITION_POSTER, '99', otherAsset)
    store.cancel(otherJob.jobId)

    // Still only 1 call (for the first avatar cancel, not the poster)
    expect(onCancel).toHaveBeenCalledTimes(1)

    destroy()
  })
})
