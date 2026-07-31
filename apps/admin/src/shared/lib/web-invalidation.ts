/**
 * Cross-app cache invalidation helper.
 * Sends a POST request to the web app's revalidation endpoint
 * to purge the featured artists cache tag.
 *
 * Safe for fire-and-forget: never throws, logs errors instead.
 */

interface WebInvalidationResult {
  revalidated: boolean
}

interface BuildWebInvalidationUrlOptions {
  url?: string
  path?: string
  tag?: string
}

/**
 * Build the revalidation endpoint URL from a base URL with dynamic query params.
 * Defaults to WEB_REVALIDATION_URL env var when no explicit URL is given.
 * Appends `?tag=...` and/or `?path=...` only when the corresponding param is present.
 */
export function buildWebInvalidationUrl({
  url,
  path,
  tag
}: BuildWebInvalidationUrlOptions = {}): string {
  const baseUrl = url ?? process.env.WEB_REVALIDATION_URL

  if (!baseUrl) {
    throw new Error(
      '[web-invalidation] WEB_REVALIDATION_URL is not set — cannot build invalidation URL'
    )
  }

  const params = new URLSearchParams()
  if (tag) params.set('tag', tag)
  if (path) params.set('path', path)

  const qs = params.toString()
  return qs ? `${baseUrl}?${qs}` : baseUrl
}

interface RevalidateWebCacheOptions {
  tag?: string
  path?: string
}

interface WebInvalidationLogger {
  error: (message: string, error: unknown) => void
}

interface BestEffortWebInvalidationDependencies {
  revalidate?: (options: RevalidateWebCacheOptions) => Promise<unknown>
  logger?: WebInvalidationLogger
}

export async function revalidateWebCache(
  options: RevalidateWebCacheOptions = {}
): Promise<WebInvalidationResult> {
  const url = buildWebInvalidationUrl({
    url: process.env.WEB_REVALIDATION_URL,
    ...options
  })
  const secret = process.env.REVALIDATION_SECRET

  if (!url) {
    throw new Error(
      '[web-invalidation] WEB_REVALIDATION_URL is not set — skipping web cache invalidation'
    )
  }

  if (!secret) {
    throw new Error(
      '[web-invalidation] REVALIDATION_SECRET is not set — skipping web cache invalidation'
    )
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`
    }
  })

  if (!response.ok) {
    throw new Error(
      `Failed to invalidate cache: ${response.status} ${response.statusText}`
    )
  }

  const result = (await response.json()) as WebInvalidationResult

  if (!result.revalidated) {
    throw new Error('Cache invalidation was not confirmed')
  }

  return result
}

export async function revalidateWebCacheBestEffort(
  options: RevalidateWebCacheOptions,
  dependencies: BestEffortWebInvalidationDependencies = {}
): Promise<void> {
  const revalidate = dependencies.revalidate ?? revalidateWebCache
  const logger = dependencies.logger ?? console

  try {
    await revalidate(options)
  } catch (error) {
    logger.error('Web cache invalidation failed', error)
  }
}
