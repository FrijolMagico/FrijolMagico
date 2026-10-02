import type { NextRequest } from 'next/server'

const CANONICAL_SLUGS_PATH = '/api/catalog/canonical-slugs'
const CANONICAL_SLUGS_TIMEOUT_MS = 1500
type CanonicalFetch = (url: URL, init: RequestInit) => Promise<Response>

function isHostname(value: string): boolean {
  return value.length <= 253 && value.split('.').every((label) =>
    label.length > 0 && label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  )
}

/** Never use an external request's Host header as an internal fetch target. */
export function canonicalSlugsUrl(
  request: NextRequest,
  deploymentHost = process.env.VERCEL_URL
): URL | null {
  if (deploymentHost && isHostname(deploymentHost)) {
    return new URL(CANONICAL_SLUGS_PATH, `https://${deploymentHost}`)
  }

  const origin = request.nextUrl
  if (origin.hostname !== 'localhost' && origin.hostname !== '127.0.0.1') {
    return null
  }
  if (origin.protocol !== 'http:' && origin.protocol !== 'https:') return null
  return new URL(CANONICAL_SLUGS_PATH, origin.origin)
}

export async function getCanonicalCatalogSlugs(
  request: NextRequest,
  fetchSlugs: CanonicalFetch = fetch,
  deploymentHost = process.env.VERCEL_URL
): Promise<string[]> {
  const url = canonicalSlugsUrl(request, deploymentHost)
  if (!url) throw new Error('No trusted internal catalog origin')

  const response = await fetchSlugs(url, {
    signal: AbortSignal.timeout(CANONICAL_SLUGS_TIMEOUT_MS),
    cache: 'no-store',
    redirect: 'error'
  })
  if (!response.ok) throw new Error('Canonical catalog endpoint unavailable')
  const body: unknown = await response.json()
  if (
    !body ||
    typeof body !== 'object' ||
    !('slugs' in body) ||
    !Array.isArray(body.slugs) ||
    !body.slugs.every((slug) => typeof slug === 'string')
  ) {
    throw new Error('Invalid canonical catalog response')
  }
  return body.slugs
}
