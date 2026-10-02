import { describe, expect, test } from 'bun:test'
import { NextRequest } from 'next/server'

import { createCatalogAliasProxy } from './proxy'

const loadCanonicalSlugs = async () => ['current-name']

describe('catalog alias proxy', () => {
  test('skips the alias resolver for an active canonical slug, even on alias conflict', async () => {
    let resolverCalls = 0
    const proxy = createCatalogAliasProxy(async () => {
      resolverCalls++
      return 'another-name'
    }, loadCanonicalSlugs)

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/current-name?ref=campaign')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(resolverCalls).toBe(0)
  })

  test('returns an HTTP 308 with the canonical Location for an active alias', async () => {
    const proxy = createCatalogAliasProxy(
      async (slug) => (slug === 'old-name' ? 'current-name' : null),
      loadCanonicalSlugs
    )

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/old-name')
    )

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      'https://example.test/catalogo/current-name'
    )
  })

  test('preserves the original query string when redirecting', async () => {
    const proxy = createCatalogAliasProxy(
      async () => 'current-name',
      loadCanonicalSlugs
    )

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/old-name?ref=campaign&page=2')
    )

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      'https://example.test/catalogo/current-name?ref=campaign&page=2'
    )
  })

  test('passes through when the resolver returns the incoming slug', async () => {
    const proxy = createCatalogAliasProxy(async (slug) => slug, async () => [])

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/current-name')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  test('passes missing aliases through without redirecting', async () => {
    let resolverCalls = 0
    const proxy = createCatalogAliasProxy(async () => {
      resolverCalls++
      return null
    }, loadCanonicalSlugs)

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/unknown-name')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(resolverCalls).toBe(1)
  })

  test('falls back to the alias resolver when the internal endpoint fails', async () => {
    let resolverCalls = 0
    const proxy = createCatalogAliasProxy(
      async () => {
        resolverCalls++
        return 'current-name'
      },
      async () => { throw new Error('Timeout') }
    )
    const response = await proxy(
      new NextRequest('https://example.test/catalogo/old-name?ref=campaign')
    )

    expect(resolverCalls).toBe(1)
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      'https://example.test/catalogo/current-name?ref=campaign'
    )
  })

  test('a refreshed canonical set after reassignment restores alias resolution', async () => {
    let slugs = ['old-name']
    const proxy = createCatalogAliasProxy(
      async () => 'current-name',
      async () => slugs
    )
    const request = () => new NextRequest('https://example.test/catalogo/old-name')

    expect((await proxy(request())).status).toBe(200)
    slugs = ['current-name']
    const response = await proxy(request())
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      'https://example.test/catalogo/current-name'
    )
  })
})
