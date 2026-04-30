/**
 * Cross-app cache invalidation helper.
 * Sends a POST request to the web app's revalidation endpoint
 * to purge the featured artists cache tag.
 *
 * Safe for fire-and-forget: never throws, logs errors instead.
 */
export async function invalidateWebFeaturedArtists(): Promise<void> {
  const url = process.env.WEB_REVALIDATION_URL
  const secret = process.env.REVALIDATION_SECRET

  if (!url) {
    console.warn(
      '[web-invalidation] WEB_REVALIDATION_URL is not set — skipping web cache invalidation'
    )
    return
  }

  if (!secret) {
    console.warn(
      '[web-invalidation] REVALIDATION_SECRET is not set — skipping web cache invalidation'
    )
    return
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`
      }
    })

    if (!response.ok) {
      console.error(
        `[web-invalidation] Failed to invalidate web featured artists cache: ${response.status} ${response.statusText}`
      )
    }
  } catch (error) {
    console.error(
      '[web-invalidation] Failed to invalidate web featured artists cache:',
      error
    )
  }
}
