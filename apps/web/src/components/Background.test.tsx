import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Background } from './Background'

describe('Background', () => {
  test('renders one body-coordinate pattern layer beneath page content', () => {
    const markup = renderToStaticMarkup(createElement(Background))

    expect(markup).toContain('pointer-events-none absolute inset-0 z-0 overflow-hidden')
    expect(markup).toContain('background-repeat:repeat')
    expect(markup).toContain('background-position:center')
  })
})
