import type {
  AssetOperationContext,
  AssetOperationPolicy
} from './asset-operation-contracts'
import {
  createAssetOperationIdentity,
  type AssetOperationIdentity
} from './asset-operation-identity'
import { createAssetOperationPolicyRegistry } from './asset-operation-policy-registry'
import type { AssetTarget } from './contracts'
import type { AssetQueue, AssetQueueJob, AssetQueueOperations } from './queue'
import { ASSET_QUEUE_STATUS } from './queue'
import {
  getSharedAssetQueue,
  setSharedAssetQueueOperations
} from './shared-asset-queue'

const MAX_CLEANUP_FAILURES = 50

export interface AssetCleanupFailure {
  jobId: string
  target: AssetTarget
  entityId: string
  correlationId: string
  error: string
}

export interface AssetOperationRuntime {
  register<TUpload, TPersist, TCleanup>(
    target: AssetTarget,
    policy: AssetOperationPolicy<TUpload, TPersist, TCleanup>
  ): void
  ensure<TUpload, TPersist, TCleanup>(
    target: AssetTarget,
    policy: AssetOperationPolicy<TUpload, TPersist, TCleanup>
  ): void
  resolve<TUpload, TPersist, TCleanup>(
    target: AssetTarget
  ): AssetOperationPolicy<TUpload, TPersist, TCleanup> | undefined
  canEnqueue: (target: AssetTarget, entityId: string) => void
  enqueue: AssetQueue['enqueue']
  cancel: AssetQueue['cancel']
  remove: AssetQueue['remove']
  retryUpload: AssetQueue['retryUpload']
  retryPersistence: AssetQueue['retryPersistence']
  retryCleanup: (jobId: string) => Promise<void>
  getCleanupFailures: () => readonly AssetCleanupFailure[]
  subscribeCleanupFailures: (
    listener: (failure: AssetCleanupFailure) => void
  ) => () => void
}

type RuntimePolicy = AssetOperationPolicy<unknown, unknown, unknown>

interface JobContext {
  metadata: Omit<AssetOperationContext, 'signal' | 'reportProgress'>
  identity: AssetOperationIdentity
  policy: RuntimePolicy
  generation: number
  controller: AbortController | null
  uploadResult: unknown
  hasUploadResult: boolean
  cleanupResult: unknown
  hasCleanupResult: boolean
  invalidated: boolean
  uploadAttempt: number
  persistenceAttempt: number
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Asset operation failed'
}

export function createAssetOperationRuntime(
  queue: AssetQueue,
  bindQueueOperations: (operations: AssetQueueOperations) => void,
  createCorrelationId: () => string = () => crypto.randomUUID(),
  operationTimeout = 30_000
): AssetOperationRuntime {
  const policies = createAssetOperationPolicyRegistry()
  const contexts = new Map<string, JobContext>()
  const pendingCleanups = new Map<string, JobContext>()
  const generations = new Map<string, number>()
  const cleanupFailures: AssetCleanupFailure[] = []
  const cleanupListeners = new Set<(failure: AssetCleanupFailure) => void>()
  let executionTail = Promise.resolve()

  const jobFor = (jobId: string) =>
    queue.getSnapshot().jobs.find((job) => job.jobId === jobId) ?? null
  // Context, generation, and attempt guards keep late callbacks off newer jobs.
  const current = (context: JobContext) =>
    contexts.get(context.metadata.jobId) === context &&
    !context.invalidated &&
    generations.get(context.identity.queueEntityId) === context.generation
  const terminal = (job: AssetQueueJob | null) =>
    job?.status === ASSET_QUEUE_STATUS.COMPLETED ||
    job?.status === ASSET_QUEUE_STATUS.CANCELLED

  const rememberPendingCleanup = (context: JobContext) => {
    const { jobId } = context.metadata
    pendingCleanups.delete(jobId)
    pendingCleanups.set(jobId, context)
    while (pendingCleanups.size > MAX_CLEANUP_FAILURES) {
      const oldestJobId = pendingCleanups.keys().next().value
      if (oldestJobId === undefined) break
      pendingCleanups.delete(oldestJobId)
    }
  }

  const runBounded = async <T>(
    context: JobContext,
    operation: (signal: AbortSignal) => Promise<T>
  ): Promise<T> => {
    const controller = new AbortController()
    context.controller = controller
    const timeout = setTimeout(
      () => controller.abort(new Error('Asset operation timed out')),
      Math.max(1, operationTimeout)
    )
    const aborted = new Promise<never>((_, reject) => {
      controller.signal.addEventListener(
        'abort',
        () => reject(controller.signal.reason),
        { once: true }
      )
    })
    try {
      return await Promise.race([operation(controller.signal), aborted])
    } finally {
      clearTimeout(timeout)
      if (context.controller === controller) context.controller = null
    }
  }

  const failIfActive = (context: JobContext, error: unknown) => {
    const job = jobFor(context.metadata.jobId)
    if (
      current(context) &&
      (job?.status === ASSET_QUEUE_STATUS.UPLOADING ||
        job?.status === ASSET_QUEUE_STATUS.PERSISTING)
    ) {
      queue.fail(context.metadata.jobId, errorMessage(error))
    }
  }

  const waitForQueueIdle = async () => {
    if (queue.getSnapshot().activeJobId === null) return
    await new Promise<void>((resolve) => {
      const unsubscribe = queue.subscribe(() => {
        if (queue.getSnapshot().activeJobId !== null) return
        unsubscribe()
        resolve()
      })
    })
  }

  const operationContext = (
    context: JobContext,
    signal: AbortSignal,
    attempt: number
  ): AssetOperationContext => ({
    ...context.metadata,
    signal,
    reportProgress: (sentBytes) => {
      const job = jobFor(context.metadata.jobId)
      if (
        current(context) &&
        context.uploadAttempt === attempt &&
        job?.status === ASSET_QUEUE_STATUS.UPLOADING
      ) {
        queue.setProgress(context.metadata.jobId, sentBytes)
      }
    }
  })

  const upload = async (job: AssetQueueJob) => {
    const context = contexts.get(job.jobId)
    if (!context || !current(context))
      throw new Error('Unknown asset operation context')
    const attempt = ++context.uploadAttempt
    const result = await runBounded(context, (signal) =>
      context.policy.upload({
        context: operationContext(context, signal, attempt),
        preparedAsset: job.preparedAsset
      })
    )
    if (current(context) && context.uploadAttempt === attempt) {
      context.uploadResult = result
      context.hasUploadResult = true
    }
  }

  const persist = async (job: AssetQueueJob) => {
    const context = contexts.get(job.jobId)
    if (!context || !current(context) || !context.hasUploadResult)
      throw new Error('Missing upload result for persistence')
    const attempt = ++context.persistenceAttempt
    // Abort stops waiting, not an already committed external persistence effect.
    // A policy that never resolves or returns no cleanup value cannot be reconciled generically.
    const persistence = (signal: AbortSignal) =>
      context.policy
        .persist({
          context: operationContext(context, signal, context.uploadAttempt),
          upload: context.uploadResult
        })
        .then((result) => {
          if (context.persistenceAttempt === attempt) {
            context.cleanupResult = result.cleanup
            context.hasCleanupResult =
              result.cleanup !== null && result.cleanup !== undefined
            if (context.hasCleanupResult) rememberPendingCleanup(context)
          }
          return result
        })
    await runBounded(context, persistence)
  }

  const cleanup = async (context: JobContext) => {
    if (!context.hasCleanupResult) return
    const value = context.cleanupResult
    context.hasCleanupResult = false
    try {
      await runBounded(context, (signal) =>
        context.policy.cleanup({
          context: operationContext(context, signal, context.uploadAttempt),
          value
        })
      )
      pendingCleanups.delete(context.metadata.jobId)
    } catch (error) {
      context.hasCleanupResult = true
      rememberPendingCleanup(context)
      const failure: AssetCleanupFailure = {
        ...context.metadata,
        error: errorMessage(error)
      }
      cleanupFailures.push(failure)
      if (cleanupFailures.length > MAX_CLEANUP_FAILURES) cleanupFailures.shift()
      for (const listener of cleanupListeners) {
        try {
          listener(failure)
        } catch (listenerError) {
          console.error('Asset cleanup failure listener failed', listenerError)
        }
      }
    }
  }

  const finalize = (context: JobContext) => {
    if (terminal(jobFor(context.metadata.jobId)))
      contexts.delete(context.metadata.jobId)
  }

  const discardUpload = (context: JobContext) => {
    if (!context.hasUploadResult || !context.policy.discardUpload) return
    const controller = new AbortController()
    void context.policy
      .discardUpload({
        context: operationContext(
          context,
          controller.signal,
          context.uploadAttempt
        ),
        upload: context.uploadResult
      })
      .catch(() => {
        // Discard is intentionally best-effort; terminal queue state remains authoritative.
      })
  }

  const persistAndCleanup = async (context: JobContext) => {
    try {
      const job = jobFor(context.metadata.jobId)
      if (!current(context) || job?.status !== ASSET_QUEUE_STATUS.PERSISTING)
        return
      await persist(job)
      if (
        !current(context) ||
        jobFor(context.metadata.jobId)?.status !== ASSET_QUEUE_STATUS.PERSISTING
      )
        return
      queue.completePersistence(context.metadata.jobId)
      await cleanup(context)
      finalize(context)
    } catch (error) {
      failIfActive(context, error)
    }
  }

  const execute = async (context: JobContext) => {
    const job = jobFor(context.metadata.jobId)
    if (!current(context) || job?.status !== ASSET_QUEUE_STATUS.ENQUEUED) return
    try {
      queue.startUpload(job.jobId)
      await upload(job)
      if (
        current(context) &&
        jobFor(job.jobId)?.status === ASSET_QUEUE_STATUS.UPLOADING
      ) {
        queue.completeUpload(job.jobId)
        await persistAndCleanup(context)
      }
    } catch (error) {
      failIfActive(context, error)
    }
  }

  const schedule = (operation: () => Promise<void>) => {
    const scheduled = executionTail.then(operation)
    executionTail = scheduled.catch((error) => {
      console.error('Unexpected asset operation scheduler failure', error)
    })
    return scheduled
  }

  bindQueueOperations({ upload, persist })

  const admitEnqueue = (target: AssetTarget, entityId: string) => {
    const policy = policies.resolve<unknown, unknown, unknown>(target)
    if (!policy) throw new Error('No asset operation policy registered')
    policy.admitEnqueue?.({ target, entityId, snapshot: queue.getSnapshot() })
    return policy
  }

  const runtime: AssetOperationRuntime = {
    register: <TUpload, TPersist, TCleanup>(
      target: AssetTarget,
      policy: AssetOperationPolicy<TUpload, TPersist, TCleanup>
    ) => policies.register(target, policy),
    ensure: <TUpload, TPersist, TCleanup>(
      target: AssetTarget,
      policy: AssetOperationPolicy<TUpload, TPersist, TCleanup>
    ) => policies.ensure(target, policy),
    resolve: <TUpload, TPersist, TCleanup>(target: AssetTarget) =>
      policies.resolve<TUpload, TPersist, TCleanup>(target),
    canEnqueue: admitEnqueue,
    enqueue: (target, entityId, preparedAsset, preview, input) => {
      const policy = admitEnqueue(target, entityId)
      const identity = createAssetOperationIdentity(target, entityId)
      for (const context of contexts.values()) {
        if (
          context.identity.queueEntityId === identity.queueEntityId &&
          current(context)
        ) {
          discardUpload(context)
          context.invalidated = true
          context.controller?.abort()
          contexts.delete(context.metadata.jobId)
        }
      }
      const generation = (generations.get(identity.queueEntityId) ?? 0) + 1
      generations.set(identity.queueEntityId, generation)
      const job = queue.enqueue(target, entityId, preparedAsset, preview, input)
      const context: JobContext = {
        metadata: {
          jobId: job.jobId,
          target,
          entityId,
          correlationId: createCorrelationId(),
          input: job.input
        },
        identity,
        policy,
        generation,
        controller: null,
        uploadResult: undefined,
        hasUploadResult: false,
        cleanupResult: undefined,
        hasCleanupResult: false,
        invalidated: false,
        uploadAttempt: 0,
        persistenceAttempt: 0
      }
      contexts.set(job.jobId, context)
      void schedule(() => execute(context))
      return { ...job, entityId }
    },
    cancel: (jobId) => {
      const context = contexts.get(jobId)
      const job = jobFor(jobId)
      if (!job || terminal(job) || job.status === ASSET_QUEUE_STATUS.FAILED)
        return
      context?.controller?.abort()
      if (context) {
        discardUpload(context)
        context.invalidated = true
      }
      queue.cancel(jobId)
      contexts.delete(jobId)
    },
    remove: (jobId) => {
      const context = contexts.get(jobId)
      context?.controller?.abort()
      if (context) {
        discardUpload(context)
        context.invalidated = true
      }
      contexts.delete(jobId)
      queue.remove(jobId)
    },
    retryUpload: (jobId) => {
      const context = contexts.get(jobId)
      if (!context) return Promise.resolve()
      return schedule(async () => {
        if (!current(context)) return
        await waitForQueueIdle()
        if (!current(context)) return
        await queue.retryUpload(jobId)
        if (jobFor(jobId)?.status === ASSET_QUEUE_STATUS.PERSISTING)
          await persistAndCleanup(context)
      })
    },
    retryPersistence: (jobId) => {
      const context = contexts.get(jobId)
      if (!context) return Promise.resolve()
      return schedule(async () => {
        if (!current(context)) return
        await waitForQueueIdle()
        if (!current(context)) return
        await queue.retryPersistence(jobId)
        if (jobFor(jobId)?.status === ASSET_QUEUE_STATUS.COMPLETED) {
          await cleanup(context)
          finalize(context)
        }
      })
    },
    retryCleanup: (jobId) => {
      const context = pendingCleanups.get(jobId)
      if (!context) return Promise.resolve()
      return schedule(async () => {
        await cleanup(context)
      })
    },
    getCleanupFailures: () =>
      cleanupFailures.map((failure) => ({ ...failure })),
    subscribeCleanupFailures: (listener) => {
      cleanupListeners.add(listener)
      return () => cleanupListeners.delete(listener)
    }
  }

  return Object.freeze(runtime)
}

const sharedRuntime = createAssetOperationRuntime(
  getSharedAssetQueue(),
  setSharedAssetQueueOperations
)

export function getSharedAssetOperationRuntime(): AssetOperationRuntime {
  return sharedRuntime
}
