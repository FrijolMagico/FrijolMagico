import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SiteForeground } from './site-foreground'

describe('SiteForeground', () => {
  test('keeps the foreground transparent while preserving its content layer and layout', () => {
    const markup = renderToStaticMarkup(
      createElement(SiteForeground, null, createElement('main', null, 'route content'))
    )

    expect(markup).toContain('data-site-foreground')
    expect(markup).not.toContain('bg-background')
    expect(markup).not.toContain('pointer-events-none')
    expect(markup).toContain('route content')
    expect(markup).toContain('relative z-10 flex min-h-0 flex-1 flex-col')
    expect(markup).not.toContain('transform')
    expect(markup).not.toContain('filter:')
    expect(markup).not.toContain('contain:')
  })
})
