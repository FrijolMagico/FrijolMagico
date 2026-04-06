import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export default async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/organizacion/:path*',
    '/artistas/:path*',
    '/eventos/:path*',
    '/configuracion/:path*'
  ]
}
