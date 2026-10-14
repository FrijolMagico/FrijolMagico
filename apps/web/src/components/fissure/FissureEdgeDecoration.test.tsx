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
