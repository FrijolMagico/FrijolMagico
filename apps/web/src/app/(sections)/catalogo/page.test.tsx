import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('catalog page streaming shell', () => {
  test('is synchronous and gives search, list, and panel independent boundaries', () => {
    expect(pageSource).toMatch(/export default function CatalogPage\(\)/)
    expect(pageSource).not.toMatch(/await\s+getCatalogData/)

    for (const wrapper of [
      'CatalogSearchServer',
      'CatalogListServer',
      'CatalogPanelServer'
    ]) {
      expect(pageSource).toMatch(
        new RegExp(`<Suspense[^>]*>[\\s\\S]*?<${wrapper}\\s*/>[\\s\\S]*?</Suspense>`)
      )
    }
    expect(pageSource).toMatch(/<Suspense fallback=\{null\}>[\s\S]*?<CatalogPanelServer\s*\/>/)
  })
})
