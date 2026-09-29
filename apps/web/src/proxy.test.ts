import { describe, expect, test } from 'bun:test'
import { NextRequest } from 'next/server'

import { createCatalogAliasProxy } from './proxy'

describe('catalog alias proxy', () => {
  test('returns an HTTP 308 with the canonical Location for an active alias', async () => {
    const proxy = createCatalogAliasProxy(async (slug) =>
      slug === 'old-name' ? 'current-name' : null
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
    const proxy = createCatalogAliasProxy(async () => 'current-name')

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/old-name?ref=campaign&page=2')
    )

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      'https://example.test/catalogo/current-name?ref=campaign&page=2'
    )
  })

  test('passes canonical slugs through when no alias exists', async () => {
    let resolverCalled = false
    const proxy = createCatalogAliasProxy(async () => {
      resolverCalled = true
      return null
    })

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/current-name')
    )

    expect(response.status).toBe(200)
    expect(resolverCalled).toBe(true)
  })

  test('passes through when the resolver returns the incoming slug', async () => {
    const proxy = createCatalogAliasProxy(async (slug) => slug)

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/current-name')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  test('passes missing aliases through without redirecting', async () => {
    const proxy = createCatalogAliasProxy(async () => null)

    const response = await proxy(
      new NextRequest('https://example.test/catalogo/unknown-name')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })
})
