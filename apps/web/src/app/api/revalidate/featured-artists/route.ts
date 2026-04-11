import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

  revalidateTag('home:featured-artists', 'max')

  return NextResponse.json({ revalidated: true })
}
