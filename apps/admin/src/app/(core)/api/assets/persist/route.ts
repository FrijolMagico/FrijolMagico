import 'server-only'

import { NextResponse } from 'next/server'

import { persistArtistAvatarAction } from '@/core/artistas/_actions/persist-artist-avatar.action'
import { getSession } from '@/shared/lib/auth/utils'

export async function POST(request: Request) {
  if (!(await getSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input: unknown = await request.json().catch(() => null)
  const result = await persistArtistAvatarAction(input)
  if (!result.success || !result.data) {
    const error = result.errors?.[0]
    return NextResponse.json(
      { error: error?.entityType ?? 'artist-avatar' },
      { status: error?.entityType === 'AVATAR_CONFLICT' ? 409 : 400 }
    )
  }
  return NextResponse.json(result.data)
}
