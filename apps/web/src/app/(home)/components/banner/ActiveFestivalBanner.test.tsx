import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ActiveFestivalBanner } from './ActiveFestivalBanner'

describe('ActiveFestivalBanner responsive art', () => {
  test('selects landscape art at md without an orientation restriction', () => {
    const markup = renderToStaticMarkup(
      createElement(ActiveFestivalBanner, { festivalSlug: 'xvi' })
    )

    expect(markup).toContain('media="(min-width: 768px)"')
    expect(markup).not.toContain('orientation:')
    expect(markup).toContain('banner-xvi-820x820.webp')
  })
})
