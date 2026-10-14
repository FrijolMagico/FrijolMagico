import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FissureEdgeDecoration } from './FissureEdgeDecoration'

const baseProps = {
  position: 'bottom' as const,
  blurId: 'blur',
  maskId: 'mask'
}

describe('FissureEdgeDecoration', () => {
  test('preserves legacy full-height placement by default', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureEdgeDecoration, {
        ...baseProps,
        height: 640,
        bottomOffset: 541
      })
    )

    expect(markup).toContain('absolute z-10 inset-0')
    expect(markup).toContain('viewBox="0 0 1920 640"')
    expect(markup).toContain('transform="translate(0 541)"')
  })

  test('anchors a width-scaled top strip independently from content height', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureEdgeDecoration, {
        ...baseProps,
        position: 'top',
        height: 99,
        bottomOffset: 0,
        stripHeight: 'calc(max(100vw, 80rem) * 99 / 1920)'
      })
    )

    expect(markup).toContain('inset-x-0 top-0')
    expect(markup).toContain('height:calc(max(100vw, 80rem) * 99 / 1920)')
    expect(markup).toContain('viewBox="0 0 1920 99"')
    expect(markup).toContain('transform="rotate(180, 960, 49.5)"')
  })

  test('aligns strip shadow continuation with the shared two-pixel content overlap', () => {
    for (const position of ['top', 'bottom'] as const) {
      const markup = renderToStaticMarkup(
        createElement(FissureEdgeDecoration, {
          ...baseProps,
          position,
          height: 99,
          bottomOffset: 0,
          stripHeight: '99px'
        })
      )

      expect(markup).toContain(position === 'top' ? 'inset-x-0 top-0' : 'bottom-0')
      expect(markup).toContain(
        position === 'top'
          ? 'y="97" width="1920" height="2"'
          : 'y="0" width="1920" height="2"'
      )
    }
  })

  test('supports a bottom-anchored fixed-reference strip without changing outline behavior', () => {
    const markup = renderToStaticMarkup(
      createElement(FissureEdgeDecoration, {
        ...baseProps,
        height: 99,
        bottomOffset: 0,
        stripHeight: 'calc(100vw * 99 / 840)'
      })
    )

    expect(markup).toContain('bottom-0')
    expect(markup).toContain('height:calc(100vw * 99 / 840)')
    expect(markup).toContain('viewBox="0 0 1920 99"')
    expect(markup).toContain('transform="translate(0 0)"')
    expect(markup).toContain('vector-effect="non-scaling-stroke"')
    expect(markup).toContain('stdDeviation="6"')
  })
})
