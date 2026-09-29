import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { PanelSidebarVersion } from '@/shared/components/sidebar/panel-sidebar-version'

describe('PanelSidebarVersion', () => {
  test('renders version with v prefix', () => {
    const markup = renderToStaticMarkup(<PanelSidebarVersion />)
    expect(markup).toMatch(/v\d+\.\d+\.\d+/)
  })

  test('renders font-mono class for monospace styling', () => {
    const markup = renderToStaticMarkup(<PanelSidebarVersion />)
    expect(markup).toContain('font-mono')
  })

  test('renders muted foreground styling', () => {
    const markup = renderToStaticMarkup(<PanelSidebarVersion />)
    expect(markup).toContain('text-sidebar-foreground/30')
  })

  test('links to the changelog after a hyphen without an underline', () => {
    const markup = renderToStaticMarkup(<PanelSidebarVersion />)
    const linkMarkup = markup.match(/<a[^>]*href="\/changelog"[^>]*>/)?.[0]
    expect(markup).toMatch(/<\/span>-[^<]*<a[^>]*href="\/changelog"/)
    expect(markup).toContain('Changelog')

    const classNames = linkMarkup?.match(/class="([^"]*)"/)?.[1].split(' ') ?? []
    expect(classNames).toContain('no-underline')
    expect(classNames).not.toContain('underline')
  })
})
