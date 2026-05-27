import { NextResponse } from 'next/server'
import { db } from '@frijolmagico/database/orm'

import { rotateFeaturedArtists } from '@/app/(cron)/_lib/rotate-featured-artists'
import { invalidateWebFeaturedArtists } from '@/shared/lib/web-invalidation'
import { sendCronitorPing } from '@/app/(cron)/_lib/send-cronitor-ping'

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

  const startedAt = Date.now()

  try {
    await sendCronitorPing({ state: 'run' })

    const result = await db.transaction((tx) => rotateFeaturedArtists(tx))

    if (!result.rotated) {
      await sendCronitorPing({
        state: 'complete',
        message: `Rotation skipped: ${result.reason}`,
        metrics: [{ name: 'rotated', value: 0 }]
      })
      return NextResponse.json({
        message: `Rotation skipped: ${result.reason}`
      })
    }

    await invalidateWebFeaturedArtists()

    const durationMs = Date.now() - startedAt
    await sendCronitorPing({
      state: 'complete',
      metrics: [
        { name: 'rotated', value: result.rotated ? 1 : 0 },
        { name: 'featured_count', value: result.count },
        { name: 'duration_ms', value: durationMs }
      ]
    })

    return NextResponse.json(result)
  } catch (error) {
    const durationMs = Date.now() - startedAt

    console.error('[cron/featured-artists] Rotation failed:', error)

    await sendCronitorPing({
      state: 'fail',
      message: (error as Error).message,
      metrics: [{ name: 'duration_ms', value: durationMs }]
    })

    return NextResponse.json({ error: 'Rotation failed' }, { status: 500 })
  }
}
