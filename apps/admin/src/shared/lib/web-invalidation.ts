/**
 * Cross-app cache invalidation transport. The low-level helper throws;
 * the batch and best-effort helpers capture failures and log them safely.
 */

import { resolveWebRevalidationMode } from '@frijolmagico/cache-tags'

interface WebInvalidationResult {
  revalidated: boolean
}

interface BuildWebInvalidationUrlOptions {
  url?: string
  path?: string
  pathType?: 'page' | 'layout'
  tag?: string
  mode?: 'swr' | 'immediate'
}

/**
 * Build the revalidation endpoint URL from a base URL with dynamic query params.
 * Defaults to WEB_REVALIDATION_URL env var when no explicit URL is given.
 * Appends `?tag=...` and/or `?path=...` only when the corresponding param is present.
 */
export function buildWebInvalidationUrl({
  url,
  path,
  pathType,
  tag,
  mode
}: BuildWebInvalidationUrlOptions = {}): string {
  if (pathType !== undefined && pathType !== 'page' && pathType !== 'layout') {
    throw new Error(`[web-invalidation] Unsupported path type: ${pathType}`)
  }
  if (pathType !== undefined && !path) {
    throw new Error(
      '[web-invalidation] A non-empty path is required with pathType'
    )
  }
  if (mode !== undefined && mode !== 'swr' && mode !== 'immediate') {
    throw new Error(`[web-invalidation] Unsupported invalidation mode: ${mode}`)
  }
  if (
    tag &&
    mode === 'swr' &&
    resolveWebRevalidationMode(tag, mode) === 'immediate'
  ) {
    throw new WebInvalidationError(
      'SWR is not supported for this protected cache tag',
      'configuration'
    )
  }

  const baseUrl = url ?? process.env.WEB_REVALIDATION_URL

  if (!baseUrl) {
    throw new Error(
      '[web-invalidation] WEB_REVALIDATION_URL is not set — cannot build invalidation URL'
    )
  }

  const params = new URLSearchParams()
  if (tag) {
    params.set('tag', tag)
    params.set('mode', resolveWebRevalidationMode(tag, mode))
  }
  if (path) {
    params.set('path', path)
    if (pathType !== undefined) params.set('pathType', pathType)
  }

  const qs = params.toString()
  return qs ? `${baseUrl}?${qs}` : baseUrl
}

export interface RevalidateWebCacheOptions {
  tag?: string
  path?: string
  pathType?: 'page' | 'layout'
  mode?: 'swr' | 'immediate'
}

interface WebInvalidationLogger {
  error: (
    message: string,
    context: Record<string, string | number | undefined>
  ) => void
}

interface BestEffortWebInvalidationDependencies {
  revalidate?: (options: RevalidateWebCacheOptions) => Promise<unknown>
  logger?: WebInvalidationLogger
}

interface WebInvalidationBatchResult {
  webRevalidation?: 'swr' | 'immediate'
}

const OPERATION_TIMEOUT_MS = 5_000
const MAX_ATTEMPTS = 2

class WebInvalidationError extends Error {
  logged = false

  constructor(
    message: string,
    readonly category: string,
    readonly status?: number
  ) {
    super(message)
    this.name = 'WebInvalidationError'
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Web cache invalidation failed'
}

function logFailure(
  logger: WebInvalidationLogger,
  error: WebInvalidationError,
  options: RevalidateWebCacheOptions,
  context: string | undefined,
  startedAt: number,
  attempts: number
): void {
  error.logged = true
  logger.error('[web-invalidation]', {
    ...(context ? { operation: context } : {}),
    tag: options.tag ?? 'none',
    mode: options.tag
      ? resolveWebRevalidationMode(options.tag, options.mode)
      : 'none',
    category: error.category,
    ...(error.status === undefined ? {} : { status: error.status }),
    durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
    attempts
  })
}

async function performRevalidation(
  options: RevalidateWebCacheOptions,
  context?: string,
  logger: WebInvalidationLogger = console
): Promise<WebInvalidationResult> {
  const startedAt = performance.now()
  let attempts = 0
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  try {
    const configuredEndpoint = process.env.WEB_REVALIDATION_URL
    const url = buildWebInvalidationUrl({
      url: configuredEndpoint,
      ...options
    })
    if (configuredEndpoint !== undefined) {
      let parsedEndpoint: URL
      try {
        parsedEndpoint = new URL(configuredEndpoint)
      } catch {
        throw new WebInvalidationError(
          'Invalid web revalidation endpoint',
          'configuration'
        )
      }
      if (
        (parsedEndpoint.protocol !== 'http:' &&
          parsedEndpoint.protocol !== 'https:') ||
        !parsedEndpoint.hostname
      ) {
        throw new WebInvalidationError(
          'Invalid web revalidation endpoint',
          'configuration'
        )
      }
    }
    const secret = process.env.REVALIDATION_SECRET

    if (!secret) {
      throw new WebInvalidationError(
        '[web-invalidation] REVALIDATION_SECRET is not set — skipping web cache invalidation',
        'configuration'
      )
    }

    const deadline = startedAt + OPERATION_TIMEOUT_MS
    const operation = async (): Promise<WebInvalidationResult> => {
      while (attempts < MAX_ATTEMPTS) {
        const remainingMs = deadline - performance.now()
        if (remainingMs <= 0) {
          throw new WebInvalidationError(
            'Web cache invalidation timed out',
            'timeout'
          )
        }
        attempts += 1
        const attemptBudgetMs = Math.min(
          remainingMs,
          remainingMs / (MAX_ATTEMPTS - attempts + 1)
        )
        const controller = new AbortController()
        try {
          const request = async (): Promise<WebInvalidationResult> => {
            const response = await fetch(url, {
              method: 'POST',
              headers: { Authorization: `Bearer ${secret}` },
              signal: controller.signal
            })

            if (!response.ok) {
              const retryable =
                response.status === 408 ||
                response.status === 429 ||
                response.status >= 500
              const failure = new WebInvalidationError(
                `Failed to invalidate cache: ${response.status} ${response.statusText}`,
                retryable ? 'transient_http' : 'http',
                response.status
              )
              throw failure
            }

            let result: WebInvalidationResult
            try {
              result = (await response.json()) as WebInvalidationResult
            } catch {
              throw new WebInvalidationError(
                'Invalid cache invalidation response',
                'malformed_response'
              )
            }

            if (!result || result.revalidated !== true) {
              throw new WebInvalidationError(
                'Cache invalidation was not confirmed',
                'unconfirmed_response'
              )
            }
            return result
          }
          const timedAttempt = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              controller.abort()
              reject(
                new WebInvalidationError(
                  'Web cache invalidation timed out',
                  'timeout'
                )
              )
            }, attemptBudgetMs)
          })
          const result = await Promise.race([request(), timedAttempt])
          if (performance.now() >= deadline) {
            throw new WebInvalidationError(
              'Web cache invalidation timed out',
              'timeout'
            )
          }
          return result
        } catch (error) {
          if (error instanceof WebInvalidationError) {
            const retryable =
              error.category === 'timeout' ||
              error.category === 'transient_http'
            if (!retryable || attempts >= MAX_ATTEMPTS) throw error
          } else if (attempts >= MAX_ATTEMPTS) {
            throw new WebInvalidationError(getErrorMessage(error), 'network')
          }
        } finally {
          if (timeoutId !== undefined) {
            clearTimeout(timeoutId)
            timeoutId = undefined
          }
        }
      }
      throw new WebInvalidationError(
        'Web cache invalidation timed out',
        'timeout'
      )
    }

    return await operation()
  } catch (error) {
    const safeError =
      error instanceof WebInvalidationError
        ? error
        : new WebInvalidationError(getErrorMessage(error), 'configuration')
    logFailure(logger, safeError, options, context, startedAt, attempts)
    throw safeError
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

/**
 * Perform one cache invalidation. Total transport and response parsing are
 * bounded to 5 seconds, with at most 2 attempts and no retry backoff.
 */
export async function revalidateWebCache(
  options: RevalidateWebCacheOptions = {}
): Promise<WebInvalidationResult> {
  return performRevalidation(options)
}

/**
 * Await independent invalidations and summarize their requested freshness policy.
 * Failures are logged per request and do not prevent other requests completing.
 */
export async function revalidateWebCacheBatch(
  requests: RevalidateWebCacheOptions[],
  context?: string
): Promise<WebInvalidationBatchResult> {
  const hasSWR = requests.some(
    (request) =>
      request.tag &&
      resolveWebRevalidationMode(request.tag, request.mode) === 'swr'
  )
  const hasEffect = requests.some((request) => request.tag || request.path)
  const summary: WebInvalidationBatchResult = hasEffect
    ? { webRevalidation: hasSWR ? 'swr' : 'immediate' }
    : {}

  await Promise.all(
    requests
      .filter((request) => request.tag || request.path)
      .map(async (request) => {
        try {
          await performRevalidation(request, context)
        } catch {
          // Each operation already logged its sanitized failure; continue the batch.
        }
      })
  )
  return summary
}

export async function revalidateWebCacheBestEffort(
  options: RevalidateWebCacheOptions,
  dependencies: BestEffortWebInvalidationDependencies = {}
): Promise<void> {
  const logger = dependencies.logger ?? console
  if (!dependencies.revalidate) {
    try {
      await performRevalidation(options, undefined, logger)
    } catch {
      // The shared operation boundary already recorded the sanitized failure.
    }
    return
  }

  try {
    await dependencies.revalidate(options)
  } catch (error) {
    const safeError =
      error instanceof WebInvalidationError
        ? error
        : new WebInvalidationError('Web cache invalidation failed', 'network')
    if (!safeError.logged) {
      logFailure(logger, safeError, options, undefined, performance.now(), 0)
    }
  }
}
