import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PodcastBanner } from './PodcastBanner'

describe('PodcastBanner frame sizing', () => {
  test('fills the explicit frame and keeps the background on the clipped content', () => {
    const markup = renderToStaticMarkup(createElement(PodcastBanner))

    expect(markup).toContain('bg-palette-shadow')
    expect(markup).toContain('h-full w-full')
    expect(markup).not.toContain('fissure-edge-strip-height')
    expect(markup).toContain('pt-12 pb-12')
  })
})
