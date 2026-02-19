import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function proxy(request: NextRequest) {
  // Verificación rápida de cookie (sin consulta a DB)
  // Esto mejora UX: redirige inmediatamente si no hay cookie
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Permite continuar - la validación real se hace en cada Server Component
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/general/:path*', '/artistas/:path*']
}
