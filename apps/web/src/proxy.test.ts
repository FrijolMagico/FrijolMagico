import { describe, expect, test } from 'bun:test'
import { NextRequest } from 'next/server'

import { createMaintenanceProxy } from './proxy'

describe('maintenance proxy', () => {
  const proxy = createMaintenanceProxy()

  test('redirects every ordinary subroute to the maintenance page at root', () => {
    const response = proxy(
      new NextRequest('https://example.test/catalogo/artist?ref=campaign')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://example.test/')
  })

  test('keeps the root page available', () => {
    const response = proxy(new NextRequest('https://example.test/'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  test.each([
    '/_next/static/chunks/app.js',
    '/_next/image?url=%2Flogo.png',
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
  ])('keeps required framework and public static resources available: %s', (pathname) => {
    const response = proxy(new NextRequest(`https://example.test${pathname}`))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  test.each([
    '/api',
    '/api/health',
    '/api/catalog/canonical-slugs',
    '/catalogo/artist.json',
    '/private/report.csv',
    '/unknown/logo.svg'
  ])('redirects API and non-public dotted routes to root: %s', (pathname) => {
    const response = proxy(new NextRequest(`https://example.test${pathname}`))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://example.test/')
  })
})
