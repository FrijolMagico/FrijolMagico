import { NextResponse } from 'next/server'
import { db } from '@frijolmagico/database/orm'

import { rotateFeaturedArtists } from '@/app/(cron)/_lib/rotate-featured-artists'
import { invalidateWebFeaturedArtists } from '@/shared/lib/web-invalidation'

/**
 * Cron route handler for weekly featured artists rotation.
 * Triggered by Vercel Cron every Monday at 06:00 UTC.
 *
 * - Validates CRON_SECRET from Authorization header
 * - Runs rotation inside a DB transaction
 * - Invalidates the web featured artists cache on success
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await db.transaction((tx) => rotateFeaturedArtists(tx))

    await invalidateWebFeaturedArtists()

    return NextResponse.json(result)
  } catch (error) {
    console.error('[cron/featured-artists] Rotation failed:', error)
    return NextResponse.json({ error: 'Rotation failed' }, { status: 500 })
  }
}
