import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FissureBanner } from './FissureBanner'

describe('FissureBanner sizing', () => {
  test('accepts explicit independent sizing for landscape and compact layouts', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureBanner, {
        landscape: { sizing: 'fixed', height: 420 },
        compact: { sizing: 'fixed', height: 360 },
        children: 'content'
      })
    )

    expect(markup).toContain('height:420px')
    expect(markup).toContain('height:360px')
  })

  test('uses fixed landscape height while compact square keeps 840 reference geometry', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureBanner, {
        landscape: { sizing: 'fixed', height: 640 },
        compact: { sizing: 'square' },
        children: 'festival'
      })
    )

    expect(markup).toContain('height:640px')
    expect(markup).toContain('aspect-square')
    expect(markup).toContain('viewBox="0 0 1920 840"')
  })

  test('keeps the fixed content layer outside transformed ancestors and clips it with the moving frame', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureBanner, {
        landscape: { sizing: 'fixed', height: 420 },
        compact: { sizing: 'fixed', height: 640 },
        children: createElement('p', null, 'stationary')
      })
    )

    expect(markup).toContain('position:fixed')
    expect(markup).toContain('height:420px')
    expect(markup).toContain('height:640px')
    expect(markup).not.toContain('-translate-x-1/2')
    expect(markup).not.toContain('translate-x-')
    expect(markup).toContain('stationary')
  })

  test('keeps frame, mask, decoration and blocker on the configured fixed geometry', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureBanner, {
        landscape: { sizing: 'fixed', height: 420 },
        compact: { sizing: 'fixed', height: 640 },
        children: createElement('p', null, 'content')
      })
    )

    expect(markup).toContain('height:420px')
    expect(markup).toContain('viewBox="0 0 1920 420"')
    expect(markup).toContain('viewBox="0 0 1920 640"')
    expect(markup).toContain('translate(0 321)')
    expect(markup).toContain('translate(0 541)')
    expect(markup).toContain('-webkit-mask-image:')
  })

  test('keeps the viewport-fixed content layer sized to its frame without transforms', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureBanner, {
        landscape: { sizing: 'fixed', height: 420 },
        compact: { sizing: 'fixed', height: 640 },
        children: createElement('section', { className: 'bg-blue-500' }, 'banner')
      })
    )

    expect(markup).toContain('position:fixed')
    expect(markup).toContain('height:420px')
    expect(markup).toContain('height:640px')
    expect(markup).toContain('class="bg-blue-500"')
    expect(markup).not.toContain('translate-x')
    expect(markup).not.toContain('transform:')
  })

  test('square compact sizing retains the legacy 840 geometry reference', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureBanner, {
        landscape: { sizing: 'fixed', height: 640 },
        compact: { sizing: 'square' },
        children: 'compact'
      })
    )

    expect(markup).toContain('aspect-square')
    expect(markup).toContain('viewBox="0 0 1920 840"')
    expect(markup).toContain('height:100vw')
    expect(markup).not.toContain('height:840px')
  })

  test('maps the CSS mask and moving decoration canvas to the same wide origin and width', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureBanner, {
        landscape: { sizing: 'fixed', height: 420 },
        compact: { sizing: 'fixed', height: 360 },
        children: 'aligned'
      })
    )

    const maskLayer = markup.match(
      /<div class="bg-background absolute [^"]*" style="([^"]*)">/
    )?.[1]
    const decorationCanvas = markup.match(
      /<div class="pointer-events-none absolute inset-0" style="([^"]*)">/
    )?.[1]

    expect(maskLayer).toMatch(/width:max\(100vw,\s*80rem\)/)
    expect(maskLayer).toMatch(/left:min\(0px,\s*calc\(\(100vw - 80rem\) \/ 2\)\)/)
    expect(decorationCanvas).toMatch(/width:max\(100vw,\s*80rem\)/)
    expect(decorationCanvas).toMatch(/left:min\(0px,\s*calc\(\(100vw - 80rem\) \/ 2\)\)/)
    expect(maskLayer).toContain('height:420px')
  })

  test('uses the fixed geometry reference consistently for mask, edge and blocker', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureBanner, {
        landscape: { sizing: 'fixed', height: 420 },
        compact: { sizing: 'fixed', height: 360 },
        children: 'fixed'
      })
    )

    expect(markup).toContain('height:420px')
    expect(markup).toContain('height:360px')
    expect(markup.match(/viewBox="0 0 1920 420"/g)).toHaveLength(2)
    expect(markup.match(/viewBox="0 0 1920 360"/g)).toHaveLength(2)
    expect(markup).toContain('translate(0 321)')
    expect(markup).toContain('translate(0 261)')
  })
})
