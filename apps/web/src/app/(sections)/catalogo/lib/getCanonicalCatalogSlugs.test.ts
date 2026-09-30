import { describe, expect, test } from 'bun:test'
import { NextRequest } from 'next/server'

import { canonicalSlugsUrl, getCanonicalCatalogSlugs } from './getCanonicalCatalogSlugs'

const request = (url: string) => new NextRequest(url)

describe('internal canonical catalog lookup', () => {
  test('never fetches an untrusted request origin', async () => {
    const external = request('https://attacker.test/catalogo/slug')
    expect(canonicalSlugsUrl(external, '')).toBeNull()
    let calls = 0
    await expect(
      getCanonicalCatalogSlugs(external, async () => {
        calls++
        return Response.json({ slugs: [] })
      }, '')
    ).rejects.toThrow('No trusted internal catalog origin')
    expect(calls).toBe(0)
  })

  test('uses trusted deployment host instead of request Host and keeps fetch uncached with a timeout', async () => {
    let fetched = ''
    const slugs = await getCanonicalCatalogSlugs(
      request('https://attacker.test/catalogo/slug'),
      async (input, init) => {
        fetched = String(input)
        expect(init?.cache).toBe('no-store')
        expect(init?.redirect).toBe('error')
        expect(init?.signal).toBeInstanceOf(AbortSignal)
        return Response.json({ slugs: ['current-name'] })
      },
      'trusted.vercel.app'
    )
    expect(fetched).toBe('https://trusted.vercel.app/api/catalog/canonical-slugs')
    expect(slugs).toEqual(['current-name'])
  })

  test('rejects non-hostname deployment values without fetching untrusted origins', async () => {
    const external = request('https://attacker.test/catalogo/a')
    for (const host of [
      'https://trusted.vercel.app', 'trusted.vercel.app:443',
      'trusted.vercel.app/path', 'trusted.vercel.app\nattacker.test',
      'trusted.vercel.app@attacker.test', 'bad..host', '-bad.host'
    ]) {
      expect(canonicalSlugsUrl(external, host)).toBeNull()
    }
    expect(canonicalSlugsUrl(request('http://localhost:3000/catalogo/a'), 'bad/path')?.href).toBe(
      'http://localhost:3000/api/catalog/canonical-slugs'
    )
  })

  test('allows only localhost or 127.0.0.1 request origins in local mode', () => {
    expect(canonicalSlugsUrl(request('http://localhost:3000/catalogo/a'), '')?.href).toBe(
      'http://localhost:3000/api/catalog/canonical-slugs'
    )
    // NextRequest normalizes 127.0.0.1 to localhost in the test runtime.
    expect(canonicalSlugsUrl(request('http://127.0.0.1:3000/catalogo/a'), '')?.href).toBe(
      'http://localhost:3000/api/catalog/canonical-slugs'
    )
    expect(canonicalSlugsUrl(request('http://local.host:3000/catalogo/a'), '')).toBeNull()
  })

  test('a redirect rejection propagates so the proxy can use the authoritative resolver', async () => {
    await expect(getCanonicalCatalogSlugs(
      request('http://localhost:3000/catalogo/a'),
      async (_url, init) => {
        expect(init.redirect).toBe('error')
        throw new TypeError('redirect rejected')
      },
      ''
    )).rejects.toThrow('redirect rejected')
  })

  test('rejects failed responses and malformed payloads so proxy can fall back', async () => {
    const local = request('http://localhost:3000/catalogo/a')
    await expect(
      getCanonicalCatalogSlugs(local, async () => new Response(null, { status: 503 }), '')
    ).rejects.toThrow('unavailable')
    await expect(
      getCanonicalCatalogSlugs(local, async () => Response.json({ slugs: [12] }), '')
    ).rejects.toThrow('Invalid canonical catalog response')
  })
})
