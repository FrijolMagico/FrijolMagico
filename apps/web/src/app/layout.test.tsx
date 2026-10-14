import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const appDirectory = new URL('.', import.meta.url)
const readAppFile = (path: string) =>
  readFileSync(new URL(path, appDirectory), 'utf8')

const routePages = [
  '(home)/page.tsx',
  '(sections)/nosotros/page.tsx',
  '(sections)/catalogo/page.tsx',
  '(sections)/catalogo/[slug]/page.tsx',
  '(sections)/festivales/page.tsx',
  '(sections)/festivales/[slug]/page.tsx',
  'not-found.tsx'
]

describe('global context bar placement', () => {
  test('renders exactly once in the root body outside SiteForeground', () => {
    const layout = readAppFile('layout.tsx')
    const bodyStart = layout.indexOf('<body')
    const foregroundStart = layout.indexOf('<SiteForeground>')
    const foregroundEnd = layout.indexOf('</SiteForeground>')
    const bodyEnd = layout.indexOf('</body>')
    const contextBarStart = layout.indexOf('<ContextBar />')

    expect(layout.match(/<ContextBar\s*\/>/g)).toHaveLength(1)
    expect(bodyStart).toBeGreaterThanOrEqual(0)
    expect(contextBarStart).toBeGreaterThan(bodyStart)
    expect(foregroundStart).toBeGreaterThan(bodyStart)
    expect(foregroundEnd).toBeLessThan(contextBarStart)
    expect(contextBarStart).toBeLessThan(bodyEnd)
    expect(layout).not.toMatch(/^[\s]*['"]use client['"]/m)
  })

  test.each(routePages)('%s has no local ContextBar or client directive', (path) => {
    const page = readAppFile(path)

    expect(page).not.toContain('ContextBar')
    expect(page).not.toMatch(/^[\s]*['"]use client['"]/m)
  })

  test('404 marker scopes hidden controls without inspecting the pathname', () => {
    const notFound = readAppFile('not-found.tsx')
    const styles = readFileSync(
      new URL('../styles/globals.css', appDirectory),
      'utf8'
    )

    expect(notFound).toContain('data-not-found')
    expect(notFound).not.toContain('ContextBar')
    expect(styles).toMatch(
      /body:has\(\[data-not-found\]\)[\s\S]*?\[data-context-bar-controls\]\s*\{\s*display:\s*none\s*;/
    )
    expect(styles).not.toContain('/catalogo')
    expect(styles).not.toContain('/festivales')
  })
})
