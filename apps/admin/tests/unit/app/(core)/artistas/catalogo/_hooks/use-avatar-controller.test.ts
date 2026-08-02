import { describe, expect, test } from 'bun:test'

import {
  ASSET_QUEUE_STATUS,
  createAssetQueue,
  type AssetQueueOperations
} from '@/shared/assets-manager/client/queue'
import { createAssetQueueStore } from '@/shared/assets-manager/client/asset-queue-store'
import {
  createAssetOperationRuntime,
  type AssetOperationRuntime
} from '@/shared/assets-manager/client/asset-operation-runtime'
import type { AssetOperationPolicy } from '@/shared/assets-manager/client/asset-operation-contracts'
import { ASSET_TARGET } from '@/shared/assets-manager/client/contracts'
import type { AssetCodec } from '@/shared/assets-manager/client/preparation'

import {
  AVATAR_CONTROLLER_PHASE,
  createAvatarController,
  type AvatarControllerOptions
} from '@/core/artistas/catalogo/_hooks/use-avatar-controller'

const file = new File(['source'], 'avatar.png', { type: 'image/png' })
const codec: AssetCodec = {
  createPreview: () => 'blob:avatar',
  revokePreview: () => {},
  decode: async () => ({ width: 800, height: 800, close: () => {} }),
  encodeWebp: async () => new Blob(['prepared'], { type: 'image/webp' })
}

function createHarness(
  policyOverrides: Partial<AssetOperationPolicy<string, string, null>> = {},
  codecOverride?: AssetCodec
) {
  const operations: AssetQueueOperations = {
    upload: async () => {},
    persist: async () => {}
  }
  const queue = createAssetQueue(() => crypto.randomUUID(), operations, {
    baseDelay: 0
  })
  const runtime = createAssetOperationRuntime(
    queue,
    (registered) => Object.assign(operations, registered),
    () => crypto.randomUUID(),
    100
  )
  const policy: AssetOperationPolicy<string, string, null> = {
    upload: async () => 'uploaded',
    persist: async () => ({ persisted: 'saved', cleanup: null }),
    cleanup: async () => {},
    ...policyOverrides
  }
  runtime.register(ASSET_TARGET.ARTIST_AVATAR, policy)
  const store = createAssetQueueStore(queue)
  const options: AvatarControllerOptions = {
    codec: codecOverride ?? codec,
    runtime,
    store
  }
  return { controller: createAvatarController(options), runtime, store }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })
  return { promise, resolve }
}

async function prepareAndEnqueue(
  controller: ReturnType<typeof createAvatarController>
) {
  const prepared = await controller.selectFile(file)
  expect(prepared.phase).toBe('ready')
  await controller.enqueue('artist-1')
}

async function waitForPhase(
  controller: ReturnType<typeof createAvatarController>,
  phase: (typeof AVATAR_CONTROLLER_PHASE)[keyof typeof AVATAR_CONTROLLER_PHASE]
) {
  if (controller.getSnapshot().phase === phase) return
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe()
      reject(new Error(`Phase ${phase} was not reached`))
    }, 250)
    const unsubscribe = controller.subscribe(() => {
      if (controller.getSnapshot().phase !== phase) return
      clearTimeout(timeout)
      unsubscribe()
      resolve()
    })
  })
}

async function waitForStoreStatus(
  store: ReturnType<typeof createAssetQueueStore>,
  status: (typeof ASSET_QUEUE_STATUS)[keyof typeof ASSET_QUEUE_STATUS]
) {
  if (store.getState().jobs.some((job) => job.status === status)) return
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe()
      reject(new Error(`Store status ${status} was not reached`))
    }, 250)
    const unsubscribe = store.subscribe(() => {
      if (!store.getState().jobs.some((job) => job.status === status)) return
      clearTimeout(timeout)
      unsubscribe()
      resolve()
    })
  })
}

describe('useAvatarController', () => {
  test('owns preparation and keeps uploading while the store job completes', async () => {
    const { controller, store } = createHarness()

    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.IDLE)
    await controller.selectFile(file)
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.READY)

    await controller.enqueue('artist-1')
    // A real consumer (useSyncExternalStore) keeps the controller subscribed,
    // which drives syncJob on every store notification.
    const unsubscribe = controller.subscribe(() => {})
    await waitForStoreStatus(store, ASSET_QUEUE_STATUS.COMPLETED)
    unsubscribe()

    // The controller no longer exposes a terminal 'completed' phase: once the
    // store job finishes, the snapshot stays 'uploading' and carries no job.
    expect(controller.getSnapshot().phase).toBe(
      AVATAR_CONTROLLER_PHASE.UPLOADING
    )
    expect(store.getState().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.COMPLETED)
  })

  test('carries the active-avatar baseline into a deferred queue upload', async () => {
    let receivedInput: unknown = null
    const expectedActive = {
      id: 8,
      path: 'artistas/artista-de-prueba/avatar-v1.webp',
      version: 'v1'
    }
    const { controller, store } = createHarness({
      upload: async ({ context }) => {
        receivedInput = 'input' in context ? context.input : null
        return 'uploaded'
      }
    })

    await controller.selectFile(file)
    await controller.enqueue('artist-1', {
      expectedActive
    })
    await waitForStoreStatus(store, ASSET_QUEUE_STATUS.COMPLETED)

    expect(receivedInput).toEqual({
      expectedActive
    })
  })

  test('maps failed upload state and retries through the runtime', async () => {
    let attempts = 0
    const { controller, store } = createHarness({
      upload: async () => {
        attempts += 1
        if (attempts === 1) throw new Error('temporary failure')
        return 'uploaded'
      }
    })

    await prepareAndEnqueue(controller)
    await waitForPhase(controller, AVATAR_CONTROLLER_PHASE.FAILED)
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.FAILED)
    expect(controller.getSnapshot().error).toBe('temporary failure')

    await controller.retry()
    const unsubscribe = controller.subscribe(() => {})
    await waitForStoreStatus(store, ASSET_QUEUE_STATUS.COMPLETED)
    unsubscribe()

    expect(attempts).toBe(2)
    expect(controller.getSnapshot().phase).toBe(
      AVATAR_CONTROLLER_PHASE.UPLOADING
    )
  })

  test('keeps unknown upload failures retryable', async () => {
    let attempts = 0
    const { controller, store } = createHarness({
      upload: async () => {
        attempts += 1
        if (attempts === 1) throw new Error('temporary failure')
        return 'uploaded'
      }
    })

    await prepareAndEnqueue(controller)
    await waitForPhase(controller, AVATAR_CONTROLLER_PHASE.FAILED)

    expect(controller.getSnapshot().errorKind).toBe('upload')
    await controller.retry()
    const unsubscribe = controller.subscribe(() => {})
    await waitForStoreStatus(store, ASSET_QUEUE_STATUS.COMPLETED)
    unsubscribe()
    expect(attempts).toBe(2)
  })

  test('treats deterministic lifecycle failures as terminal and discards on cancel', async () => {
    let attempts = 0
    let discards = 0
    const { controller } = createHarness({
      upload: async () => {
        attempts += 1
        return 'uploaded'
      },
      persist: async () => {
        throw new Error('INVALID_RECEIPT')
      },
      discardUpload: async () => {
        discards += 1
      }
    })

    await prepareAndEnqueue(controller)
    await waitForPhase(controller, AVATAR_CONTROLLER_PHASE.FAILED)

    expect(controller.getSnapshot().errorKind).toBe('validation')
    await controller.retry()
    expect(attempts).toBe(1)

    controller.cancel()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(discards).toBe(1)
  })

  test('classifies deterministic preparation failures as validation', async () => {
    const { controller } = createHarness(
      {},
      {
        createPreview: () => 'blob:avatar',
        revokePreview: () => {},
        decode: async () => ({ width: 800, height: 900, close: () => {} }),
        encodeWebp: async () => new Blob(['prepared'], { type: 'image/webp' })
      }
    )

    await controller.selectFile(file)

    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.FAILED)
    expect(controller.getSnapshot().errorKind).toBe('validation')
    expect(controller.getSnapshot().error).toBe(
      'Dimensiones inválidas, la imágen debe ser cuadrada.'
    )
  })

  test('retry re-prepares the retained file after an unknown preparation failure', async () => {
    let decodeAttempts = 0
    const { controller } = createHarness(
      {},
      {
        createPreview: () => 'blob:avatar',
        revokePreview: () => {},
        decode: async () => {
          decodeAttempts += 1
          if (decodeAttempts === 1) throw new Error('codec unavailable')
          return { width: 800, height: 800, close: () => {} }
        },
        encodeWebp: async () => new Blob(['prepared'], { type: 'image/webp' })
      }
    )

    await controller.selectFile(file)
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.FAILED)
    expect(controller.getSnapshot().errorKind).toBe('unknown')

    await controller.retry()

    expect(decodeAttempts).toBe(2)
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.READY)
    expect(controller.getSnapshot().errorKind).toBeNull()
  })

  test('retry does not re-prepare deterministic validation failures', async () => {
    let decodeAttempts = 0
    const { controller } = createHarness(
      {},
      {
        createPreview: () => 'blob:avatar',
        revokePreview: () => {},
        decode: async () => {
          decodeAttempts += 1
          return { width: 800, height: 900, close: () => {} }
        },
        encodeWebp: async () => new Blob(['prepared'], { type: 'image/webp' })
      }
    )

    await controller.selectFile(file)
    expect(controller.getSnapshot().errorKind).toBe('validation')

    await controller.retry()

    expect(decodeAttempts).toBe(1)
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.FAILED)
  })

  test('preflights avatar admission before attempting a duplicate enqueue', async () => {
    const upload = deferred<string>()
    let admissions = 0
    const { controller, runtime, store } = createHarness({
      admitEnqueue: ({ snapshot, entityId }) => {
        admissions++
        if (snapshot.jobs.some((job) => job.entityId === entityId))
          throw new Error('Avatar upload is already queued for this artist')
      },
      upload: async () => upload.promise
    })
    const duplicate = createAvatarController({ codec, runtime, store })

    await controller.selectFile(file)
    await controller.enqueue('artist-1')
    await duplicate.selectFile(file)
    await duplicate.enqueue('artist-1')

    expect(admissions).toBe(3)
    expect(duplicate.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.FAILED)
    expect(duplicate.getSnapshot().error).toBe(
      'Avatar upload is already queued for this artist'
    )
    upload.resolve('uploaded')
  })

  test('cancel and reset release local preparation without owning queue FSM', async () => {
    const { controller, runtime } = createHarness()
    await controller.selectFile(file)
    controller.cancel()

    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.IDLE)
    expect(controller.getSnapshot().preview).toBeNull()
    expect(runtime.getCleanupFailures()).toHaveLength(0)

    controller.reset()
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.IDLE)
  })

  test('completion never surfaces a job in the snapshot', async () => {
    const { controller, store } = createHarness()

    await prepareAndEnqueue(controller)
    await waitForStoreStatus(store, ASSET_QUEUE_STATUS.COMPLETED)

    expect(controller.getSnapshot().phase).toBe(
      AVATAR_CONTROLLER_PHASE.UPLOADING
    )
    expect(controller.getSnapshot()).not.toHaveProperty('job')
  })

  test('reset while a store job runs keeps the job completing without cancelling the runtime', async () => {
    const upload = deferred<string>()
    const { controller, store } = createHarness({
      upload: async () => upload.promise
    })

    await prepareAndEnqueue(controller)
    expect(store.getState().jobs[0]?.status).toBe(
      ASSET_QUEUE_STATUS.UPLOADING
    )

    controller.reset()
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.IDLE)
    expect(controller.getSnapshot().currentAvatar).toBeNull()

    // Let the background store job finish: reset must not have cancelled or
    // removed it, so it still reaches COMPLETED in the store.
    upload.resolve('uploaded')
    await waitForStoreStatus(store, ASSET_QUEUE_STATUS.COMPLETED)

    expect(store.getState().jobs[0]?.status).toBe(ASSET_QUEUE_STATUS.COMPLETED)
    // currentJobId was cleared by reset, so the snapshot never re-syncs.
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.IDLE)
  })

  describe('syncAvatar', () => {
    test('updates currentAvatar when phase is idle', () => {
      const { controller } = createHarness()
      expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.IDLE)
      expect(controller.getSnapshot().currentAvatar).toBeNull()

      controller.syncAvatar({ path: 'avatars/test.png', version: null })

      expect(controller.getSnapshot().currentAvatar).toEqual({
        path: 'avatars/test.png',
        version: null
      })
    })

    test('updates currentAvatar when phase is uploading', async () => {
      const { controller } = createHarness()
      await controller.selectFile(file)
      expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.READY)

      await controller.enqueue('artist-1')
      expect(controller.getSnapshot().phase).toBe(
        AVATAR_CONTROLLER_PHASE.UPLOADING
      )

      controller.syncAvatar({ path: 'new-avatar.png', version: 'v2' })

      expect(controller.getSnapshot().currentAvatar).toEqual({
        path: 'new-avatar.png',
        version: 'v2'
      })
    })

    test('does NOT update currentAvatar when phase is ready (preserves prepared preview)', async () => {
      const { controller } = createHarness()
      await controller.selectFile(file)
      expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.READY)
      expect(controller.getSnapshot().currentAvatar).toBeNull()

      controller.syncAvatar({ path: 'should-not-update.png', version: null })

      // currentAvatar stays null because phase===ready prevents update
      expect(controller.getSnapshot().currentAvatar).toBeNull()
    })

    test('accepts null avatar (clears currentAvatar when idle)', () => {
      const { controller } = createHarness()
      // Set an initial avatar
      controller.syncAvatar({ path: 'avatars/initial.png', version: 'v1' })
      expect(controller.getSnapshot().currentAvatar).toEqual({
        path: 'avatars/initial.png',
        version: 'v1'
      })

      // Clear it
      controller.syncAvatar(null)
      expect(controller.getSnapshot().currentAvatar).toBeNull()
    })
  })
})
