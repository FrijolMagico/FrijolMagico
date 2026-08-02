'use client'

import { useState, useSyncExternalStore } from 'react'

import { ensureArtistAvatarPolicy } from '../_lib/artist-avatar-production-composition'
import { ARTIST_AVATAR_PREPARATION_SPEC } from '../_lib/artist-avatar-preparation-policy'

import { createBrowserImageCodec } from '@/shared/assets-manager/client/browser-image-codec'
import {
  getSharedAssetOperationRuntime,
  type AssetOperationRuntime
} from '@/shared/assets-manager/client/asset-operation-runtime'
import {
  getSharedAssetQueueStore,
  type SharedAssetQueueStore
} from '@/shared/assets-manager/client/shared-asset-queue'
import {
  ASSET_TARGET,
  type LocalPreviewHandle,
  type PreparedAsset
} from '@/shared/assets-manager/client/contracts'
import {
  createPreparationController,
  type AssetCodec,
  type AssetSource,
  type PreparationErrorKind,
  type PreparationResult
} from '@/shared/assets-manager/client/preparation'
import {
  ASSET_QUEUE_STATUS,
  type AssetQueueJob,
  type AssetQueueStatus
} from '@/shared/assets-manager/client/queue'
import type { ManagedAssetReference } from '@/shared/assets-manager/managed-asset-reference'
import type { ExpectedActiveAvatar } from '../_lib/avatar-history-contracts'

ensureArtistAvatarPolicy()

const AVATAR_CONTROLLER_PHASE = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  READY: 'ready',
  UPLOADING: 'uploading',
  FAILED: 'failed'
} as const

export { AVATAR_CONTROLLER_PHASE }
export type AvatarControllerPhase =
  (typeof AVATAR_CONTROLLER_PHASE)[keyof typeof AVATAR_CONTROLLER_PHASE]

export type AvatarErrorKind = PreparationErrorKind | 'upload' | 'persist'

const DETERMINISTIC_LIFECYCLE_ERRORS = new Set([
  'AVATAR_CONFLICT',
  'INVALID_RECEIPT',
  'ARTIST_DELETED'
])

export interface AvatarControllerState {
  phase: AvatarControllerPhase
  preview: LocalPreviewHandle | null
  currentAvatar: ManagedAssetReference | null
  error: string | null
  errorKind: AvatarErrorKind | null
}

export interface AvatarControllerOptions {
  codec?: AssetCodec
  runtime?: AssetOperationRuntime
  store?: SharedAssetQueueStore
  initialAvatar?: ManagedAssetReference | null
}

function phaseForStatus(status: AssetQueueStatus): AvatarControllerPhase {
  // A finished store job no longer maps to a terminal controller phase: the
  // controller only owns the in-flight window, so 'uploading' ≈ "a background
  // store job exists for this entity". The store remains the progress truth.
  if (status === ASSET_QUEUE_STATUS.COMPLETED)
    return AVATAR_CONTROLLER_PHASE.UPLOADING
  if (status === ASSET_QUEUE_STATUS.FAILED)
    return AVATAR_CONTROLLER_PHASE.FAILED
  return AVATAR_CONTROLLER_PHASE.UPLOADING
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'No se pudo cargar el avatar'
}

function errorKindForJob(job: AssetQueueJob): AvatarErrorKind | null {
  if (job.error && DETERMINISTIC_LIFECYCLE_ERRORS.has(job.error))
    return 'validation'
  return job.failedStep ?? null
}

export interface AvatarEnqueueInput {
  expectedActive?: ExpectedActiveAvatar | null
  activation?: { catalogId: number; requestedActive: boolean }
}

interface AvatarController {
  getSnapshot: () => AvatarControllerState
  subscribe: (listener: () => void) => () => void
  selectFile: (file: File) => Promise<PreparationResult>
  enqueue: (
    entityId: string | number,
    input?: AvatarEnqueueInput
  ) => Promise<void>
  cancel: () => void
  retry: () => Promise<void>
  reset: () => void
  syncAvatar: (avatar: ManagedAssetReference | null) => void
}

export function createAvatarController(
  options: AvatarControllerOptions = {}
): AvatarController {
  const runtime = options.runtime ?? getSharedAssetOperationRuntime()
  const store = options.store ?? getSharedAssetQueueStore()
  const preparation = createPreparationController(
    options.codec ?? createBrowserImageCodec()
  )
  const listeners = new Set<() => void>()
  let currentJobId: string | null = null
  let preparedAsset: PreparedAsset | null = null
  let preparedPreview: LocalPreviewHandle | null = null
  let lastSource: AssetSource | null = null
  let snapshot: AvatarControllerState = {
    phase: AVATAR_CONTROLLER_PHASE.IDLE,
    preview: null,
    currentAvatar: options.initialAvatar ?? null,
    error: null,
    errorKind: null
  }

  const notify = () => {
    for (const listener of listeners) listener()
  }
  const update = (next: Partial<AvatarControllerState>) => {
    snapshot = { ...snapshot, ...next }
    notify()
  }
  const currentJob = () =>
    currentJobId === null
      ? null
      : (store.getState().jobs.find((job) => job.jobId === currentJobId) ??
        null)
  const syncJob = () => {
    const job = currentJob()
    if (!job) return
    update({
      phase: phaseForStatus(job.status),
      error: job.error,
      errorKind:
        job.status === ASSET_QUEUE_STATUS.FAILED ? errorKindForJob(job) : null
    })
  }
  const releasePreparation = () => {
    preparation.cancel()
    preparedPreview?.release()
    preparedAsset = null
    preparedPreview = null
  }
  const prepareFromSource = async (source: AssetSource) => {
    update({
      phase: AVATAR_CONTROLLER_PHASE.PREPARING,
      error: null,
      errorKind: null
    })
    const result = await preparation.prepare({
      target: ASSET_TARGET.ARTIST_AVATAR,
      source,
      resize: ARTIST_AVATAR_PREPARATION_SPEC
    })
    if (result.phase === 'ready' && result.preparedAsset && result.preview) {
      preparedAsset = result.preparedAsset
      preparedPreview = result.preview
      update({
        phase: AVATAR_CONTROLLER_PHASE.READY,
        preview: result.preview,
        error: null,
        errorKind: null
      })
    } else {
      update({
        phase:
          result.phase === 'cancelled'
            ? AVATAR_CONTROLLER_PHASE.IDLE
            : AVATAR_CONTROLLER_PHASE.FAILED,
        preview: null,
        error: result.error,
        errorKind: result.errorKind
      })
    }
    return result
  }

  let unsubscribeStore: (() => void) | null = null
  const controller: AvatarController = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      if (listeners.size === 1)
        unsubscribeStore = store.subscribe(() => syncJob())
      syncJob()
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          unsubscribeStore?.()
          unsubscribeStore = null
        }
      }
    },
    async selectFile(file) {
      releasePreparation()
      lastSource = {
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file
      }
      return prepareFromSource(lastSource)
    },
    async enqueue(entityId, input) {
      if (!preparedAsset) {
        update({
          phase: AVATAR_CONTROLLER_PHASE.FAILED,
          error: 'Selecciona una imagen antes de cargarla'
        })
        return
      }
      try {
        runtime.canEnqueue(ASSET_TARGET.ARTIST_AVATAR, String(entityId))
        const job = runtime.enqueue(
          ASSET_TARGET.ARTIST_AVATAR,
          String(entityId),
          preparedAsset,
          preparedPreview ?? undefined,
          input
        )
        currentJobId = job.jobId
        preparedAsset = null
        preparedPreview = null
        lastSource = null
        update({
          phase: AVATAR_CONTROLLER_PHASE.UPLOADING,
          preview: job.preview,
          error: null,
          errorKind: null
        })
        syncJob()
      } catch (error) {
        update({
          phase: AVATAR_CONTROLLER_PHASE.FAILED,
          error: errorMessage(error)
        })
      }
    },
    cancel() {
      const job = currentJob()
      if (job?.status === ASSET_QUEUE_STATUS.FAILED) runtime.remove(job.jobId)
      else if (currentJobId) runtime.cancel(currentJobId)
      releasePreparation()
      currentJobId = null
      lastSource = null
      update({
        phase: AVATAR_CONTROLLER_PHASE.IDLE,
        preview: null,
        error: null,
        errorKind: null
      })
    },
    async retry() {
      if (snapshot.errorKind === 'validation') return
      const job = currentJob()
      if (job && job.status === ASSET_QUEUE_STATUS.FAILED) {
        if (job.failedStep === 'upload') await runtime.retryUpload(job.jobId)
        else if (job.failedStep === 'persist')
          await runtime.retryPersistence(job.jobId)
        syncJob()
        return
      }
      if (snapshot.errorKind === 'unknown' && lastSource) {
        releasePreparation()
        await prepareFromSource(lastSource)
      }
    },
    reset() {
      releasePreparation()
      currentJobId = null
      lastSource = null
      update({
        phase: AVATAR_CONTROLLER_PHASE.IDLE,
        preview: null,
        error: null,
        errorKind: null
      })
    },
    syncAvatar(avatar: ManagedAssetReference | null) {
      if (snapshot.phase !== AVATAR_CONTROLLER_PHASE.READY) {
        update({ currentAvatar: avatar })
      }
    }
  }

  return controller
}

export function useAvatarController(options: AvatarControllerOptions = {}) {
  const [controller] = useState(() => createAvatarController(options))
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  )
  return { state, ...controller }
}
