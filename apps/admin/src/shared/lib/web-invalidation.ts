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

export async function invalidateWebFeaturedArtists(): Promise<WebInvalidationResult> {
  const url = process.env.WEB_REVALIDATION_URL
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
