import { NextRequest, NextResponse } from 'next/server'

/**
 * Redirect to the unified /api/revalidate endpoint.
 *
 * Kept during transition so existing WEB_REVALIDATION_URL values
 * (pointing to the old /api/revalidate/featured-artists path)
 * don't 404 until the env var is updated in Vercel dashboard.
 *
 * 308 preserves POST method and Authorization header on same-origin
 * redirects, so the admin's fetch() will follow transparently.
 */
export async function POST(request: NextRequest) {
  const url = new URL('/api/revalidate', request.url)
  url.search = request.nextUrl.search
  return NextResponse.redirect(url, 308)
}
