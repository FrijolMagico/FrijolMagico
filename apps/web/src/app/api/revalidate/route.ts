import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expectedSecret = process.env.REVALIDATION_SECRET

  if (!expectedSecret) {
    console.error(
      '[revalidate] REVALIDATION_SECRET is not configured'
    )
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag')
  const path = request.nextUrl.searchParams.get('path')
  const pathType = request.nextUrl.searchParams.get('pathType')
  const mode = request.nextUrl.searchParams.get('mode')

  if (mode !== null && mode !== 'swr' && mode !== 'immediate') {
    return NextResponse.json({ error: 'Unsupported revalidation mode' }, { status: 400 })
  }

  if (pathType !== null && pathType !== 'page' && pathType !== 'layout') {
    return NextResponse.json({ error: 'Unsupported path type' }, { status: 400 })
  }
  if (pathType !== null && !path) {
    return NextResponse.json({ error: 'A non-empty path is required with pathType' }, { status: 400 })
  }

  if (tag) {
    revalidateTag(tag, mode === 'immediate' ? { expire: 0 } : 'max')
  }
  if (path) {
    if (pathType !== null) {
      revalidatePath(path, pathType)
    } else {
      revalidatePath(path)
    }
  }

  return NextResponse.json({ revalidated: true })
}
