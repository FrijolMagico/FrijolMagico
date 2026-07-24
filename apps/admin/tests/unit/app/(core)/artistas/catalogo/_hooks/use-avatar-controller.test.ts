import { describe, expect, test } from 'bun:test'

import {
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
  policyOverrides: Partial<AssetOperationPolicy<string, string, null>> = {}
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
  const options: AvatarControllerOptions = { codec, runtime, store }
  return { controller: createAvatarController(options), runtime, store }
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

describe('useAvatarController', () => {
  test('owns preparation and exposes completed queue state', async () => {
    const { controller } = createHarness()

    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.IDLE)
    await controller.selectFile(file)
    expect(controller.getSnapshot().phase).toBe(AVATAR_CONTROLLER_PHASE.READY)

    await controller.enqueue('artist-1')
    await waitForPhase(controller, AVATAR_CONTROLLER_PHASE.COMPLETED)

    expect(controller.getSnapshot().phase).toBe(
      AVATAR_CONTROLLER_PHASE.COMPLETED
    )
    expect(controller.getSnapshot().job?.target).toBe(
      ASSET_TARGET.ARTIST_AVATAR
    )
  })

  test('maps failed upload state and retries through the runtime', async () => {
    let attempts = 0
    const { controller } = createHarness({
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
    await waitForPhase(controller, AVATAR_CONTROLLER_PHASE.COMPLETED)

    expect(attempts).toBe(2)
    expect(controller.getSnapshot().phase).toBe(
      AVATAR_CONTROLLER_PHASE.COMPLETED
    )
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
})
