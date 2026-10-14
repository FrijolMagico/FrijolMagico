import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FissureFooter } from './fissure-footer'

describe('FissureFooter', () => {
  test('uses the mobile 640px frame and md 400px frame for both layers', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureFooter, null, createElement('div', null, 'footer content'))
    )

    const footerFrame = markup.match(/<footer\b[^>]*>/)?.[0]
    const fixedContent = markup.match(
      /<div class="fixed h-\[640px\] md:h-\[400px\]"/
    )?.[0]

    expect(footerFrame).toBeDefined()
    expect(fixedContent).toBeDefined()
    expect(footerFrame).toContain('overflow-hidden')
    expect(markup).toContain('data-fissure-footer')
    expect(markup).not.toContain('sticky')
    expect(footerFrame).toContain('h-[640px]')
    expect(footerFrame).toContain('md:h-[400px]')
    expect(footerFrame).not.toContain('820px')
    expect(footerFrame).not.toContain('portrait')
    expect(markup).toContain('position:fixed;bottom:0;left:0;width:100%')
    expect(markup).toContain('width:max(100vw, 80rem)')
    expect(markup).toContain('left:min(0px, calc((100vw - 80rem) / 2))')
    expect(fixedContent).toContain('h-[640px] md:h-[400px]')
    expect(fixedContent).not.toContain('820px')
    expect(fixedContent).not.toContain('portrait')
    expect(markup).toContain('height:99px')
    expect(markup).toContain('viewBox="0 0 1920 99"')
    expect(markup).toContain('bg-primary')
    expect(markup.match(/footer content/g)).toHaveLength(1)
  })
})
