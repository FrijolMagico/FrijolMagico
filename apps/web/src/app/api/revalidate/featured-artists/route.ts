import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expectedSecret = process.env.REVALIDATION_SECRET

  if (!expectedSecret) {
    console.error(
      '[revalidate/featured-artists] REVALIDATION_SECRET is not configured'
    )
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag')
  const path = request.nextUrl.searchParams.get('path')

  if (tag) {
    revalidateTag(tag, { expire: 0 })
  }
  if (path) {
    revalidatePath(path)
  }

  return NextResponse.json({ revalidated: true })
}
