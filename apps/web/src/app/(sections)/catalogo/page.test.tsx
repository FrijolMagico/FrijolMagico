import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('catalog page streaming shell', () => {
  test('is synchronous and renders search, list, and panel in the static page tree', () => {
    expect(pageSource).toMatch(/export default function CatalogPage\(\)/)
    expect(pageSource).not.toMatch(/await\s+getCatalogData/)

    for (const component of [
      'CatalogSearchServer',
      'CatalogListServer',
      'CatalogPanelServer'
    ]) {
      expect(pageSource).toMatch(new RegExp(`<${component}\\s*/>`))
    }
    expect(pageSource).not.toContain('<Suspense')
  })
})
