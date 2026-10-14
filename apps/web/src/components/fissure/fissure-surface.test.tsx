import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FISSURE_EDGE_HEIGHT } from './constants'
import { FissureSurface } from './fissure-surface'

describe('FissureSurface', () => {
  test('natural-height mode keeps the content in flow and shares width-scaled top geometry', () => {
    const markup = renderToStaticMarkup(
      createElement(
        FissureSurface,
        {
          geometryHeight: FISSURE_EDGE_HEIGHT,
          edge: 'top',
          sizing: 'natural',
          surfaceClassName: 'bg-primary'
        },
        createElement('div', null, 'natural footer')
      )
    )

    expect(markup).toContain('bg-primary relative overflow-hidden')
    expect(markup).toContain('height:99px')
    expect(markup).toContain('viewBox="0 0 1920 99"')
    expect(markup).toContain('natural footer')
    expect(markup).not.toContain('height:400px')
  })

  test('top and bottom edge amplitude is fixed while banner frame geometry stays independent', () => {
    for (const geometryHeight of [360, 400, 420, 640, 840]) {
      for (const edge of ['top', 'bottom'] as const) {
        const markup = renderToStaticMarkup(
          createElement(FissureSurface, {
            geometryHeight,
            height: geometryHeight,
            edge
          })
        )

        expect(markup).toContain('height:99px')
        expect(markup).toContain('viewBox="0 0 1920 99"')
        expect(markup).toContain('var(--fissure-edge-strip-height)')
      }
    }
  })

  test('fixed-frame mode keeps the top strip amplitude fixed over the explicit scrolling frame', () => {
    const markup = renderToStaticMarkup(
      createElement(
        FissureSurface,
        {
          geometryHeight: 400,
          height: '100%',
          edge: 'top',
          sizing: 'fixed-frame',
          surfaceClassName: 'bg-primary'
        },
        createElement(
          'div',
          { style: { position: 'fixed', bottom: 0 } },
          'stationary footer'
        )
      )
    )

    expect(markup).toContain('bg-primary absolute top-0 overflow-hidden')
    expect(markup).toContain('width:max(100vw, 80rem)')
    expect(markup).toContain('left:min(0px, calc((100vw - 80rem) / 2))')
    expect(markup).toContain('height:100%')
    expect(markup).toContain('height:99px')
    expect(markup).toContain('viewBox="0 0 1920 99"')
    expect(markup).toContain('position:fixed;bottom:0')
    expect(markup).toContain('stationary footer')
  })

  test('shares one wide canvas origin and geometry between mask and contour', () => {
    const markup = renderToStaticMarkup(
      createElement(
        FissureSurface,
        {
          geometryHeight: 420,
          height: 420,
          edge: 'bottom',
          overlay: createElement('div', { 'data-testid': 'blocker-slot' })
        },
        createElement('div', { style: { position: 'fixed' } }, 'banner')
      )
    )

    const maskLayer = markup.match(
      /<div class="bg-background absolute top-0 overflow-hidden" style="([^"]*)">/
    )?.[1]
    const contourCanvas = markup.match(
      /<div class="pointer-events-none absolute inset-0" style="([^"]*)">/
    )?.[1]

    expect(maskLayer).toContain('width:max(100vw, 80rem)')
    expect(maskLayer).toContain('left:min(0px, calc((100vw - 80rem) / 2))')
    expect(contourCanvas).toBeDefined()
    expect(contourCanvas).toContain('width:max(100vw, 80rem)')
    expect(contourCanvas).toContain('left:min(0px, calc((100vw - 80rem) / 2))')
    expect(markup).toContain('viewBox="0 0 1920 99"')
    expect(markup).toContain('transform="translate(0 0)"')
    expect(markup).toContain('position:fixed')
    expect(markup).toContain('data-testid="blocker-slot"')
  })
})
