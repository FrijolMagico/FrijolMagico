import 'server-only'

import { NextResponse } from 'next/server'

import { discardArtistAvatarAction } from '@/core/artistas/_actions/discard-artist-avatar.action'
import { getSession } from '@/shared/lib/auth/utils'

export async function POST(request: Request) {
  if (!(await getSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input: unknown = await request.json().catch(() => null)
  const result = await discardArtistAvatarAction(input)
  if (!result.success)
    return NextResponse.json(
      { error: result.errors?.[0]?.entityType ?? 'artist-avatar' },
      { status: 400 }
    )
  return new NextResponse(null, { status: 204 })
}
