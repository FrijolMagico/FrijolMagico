import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FissureFooter } from './fissure-footer'

describe('FissureFooter', () => {
  test('uses responsive clipped and fixed layers with the fissure surface', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureFooter, null, createElement('div', null, 'footer content'))
    )

    const footerFrame = markup.match(/<footer\b[^>]*>/)?.[0]
    const fixedContent = [...markup.matchAll(/<div class="([^"]*)"[^>]*>/g)]
      .map(([, className]) => className)
      .find((className) => className.split(' ').includes('fixed'))

    expect(footerFrame).toBeDefined()
    expect(fixedContent).toBeDefined()
    expect(footerFrame).toContain('relative z-20 h-140 w-full overflow-hidden md:h-90')
    expect(markup).toContain('data-fissure-footer')
    expect(markup).not.toContain('sticky')
    expect(footerFrame).not.toContain('820px')
    expect(footerFrame).not.toContain('portrait')
    expect(markup).toContain('width:max(100vw, 80rem)')
    expect(markup).toContain('left:min(0px, calc((100vw - 80rem) / 2))')
    expect(fixedContent?.split(' ')).toEqual(
      expect.arrayContaining(['fixed', 'bottom-0', 'left-0', 'h-160', 'w-full', 'md:h-90'])
    )
    expect(fixedContent).not.toContain('820px')
    expect(fixedContent).not.toContain('portrait')
    expect(markup).toContain('height:99px')
    expect(markup).toContain('viewBox="0 0 1920 99"')
    expect(markup).toContain('bg-primary')
    expect(markup.match(/footer content/g)).toHaveLength(1)
  })
})
