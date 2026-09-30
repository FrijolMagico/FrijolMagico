import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_STATIC_PATHS = new Set([
  '/OG.png',
  '/favicon.ico',
  '/robots.txt',
  '/fonts/canarina/Canarina-Chica.woff2',
  '/fonts/canarina/Canarina-Grande.woff2',
  '/fonts/canarina/Canarina-Mediana.woff2',
  '/fonts/sections/festivales/2025/SuperFortress.woff2',
  '/sections/banner/banner-xvi.png',
  '/sections/festivales/2025/images/BACK.webp',
  '/sections/festivales/2025/images/CITY.webp',
  '/sections/festivales/2025/images/GROUND.webp',
  '/sections/festivales/2025/images/PJ.webp',
  '/sections/festivales/2025/images/ROCKS.webp',
  '/sections/nosotros/equipo.webp',
  '/sections/nosotros/frijol-1.webp',
  '/sections/nosotros/frijol-2.webp'
])

export function createMaintenanceProxy() {
  return function maintenanceProxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (
      pathname === '/' ||
      pathname.startsWith('/_next/static/') ||
      pathname === '/_next/image' ||
      PUBLIC_STATIC_PATHS.has(pathname)
    ) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const proxy = createMaintenanceProxy()

export const config = {
  matcher: '/:path*'
}
