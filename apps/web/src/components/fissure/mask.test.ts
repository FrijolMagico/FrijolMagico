import { describe, expect, test } from 'bun:test'

import {
  FISSURE_EDGE_HEIGHT,
  FISSURE_EDGE_PATH,
  FISSURE_TOP_TRANSFORM,
  VIEWBOX_WIDTH
} from './constants'
import { createFissureMaskStyle } from './mask'

function getMaskSvg(
  height: number,
  options?: Parameters<typeof createFissureMaskStyle>[1]
) {
  const style = createFissureMaskStyle(height, options)
  const dataUri = style.maskImage
  if (typeof dataUri !== 'string') {
    throw new Error('Expected maskImage to be a data URI')
  }

  const encodedSvg = dataUri.match(
    /url\("data:image\/svg\+xml,([^\"]+)"\)/
  )?.[1]
  if (!encodedSvg) {
    throw new Error('Expected maskImage to contain an encoded SVG')
  }

  return decodeURIComponent(encodedSvg)
}

describe('createFissureMaskStyle', () => {
  const height = 640
  const rectHeightWithOneEdge = height - FISSURE_EDGE_HEIGHT + 1 + 2

  test('keeps the top fissure as the default', () => {
    const svg = getMaskSvg(height)

    expect(svg).toContain(`viewBox="0 0 ${VIEWBOX_WIDTH} ${height}"`)
    expect(svg).toContain(`y="${FISSURE_EDGE_HEIGHT - 2}"`)
    expect(svg).toContain(`height="${rectHeightWithOneEdge}"`)
    expect(svg).toContain(`transform="${FISSURE_TOP_TRANSFORM}"`)
    expect(svg).not.toContain(`translate(0 ${height - FISSURE_EDGE_HEIGHT})`)
  })

  test('includes both fissures when bottom is enabled', () => {
    const svg = getMaskSvg(height, { bottom: true })

    expect(svg).toContain(`height="${height - FISSURE_EDGE_HEIGHT * 2 + 1 + 4}"`)
    expect(svg).toContain(`transform="${FISSURE_TOP_TRANSFORM}"`)
    expect(svg).toContain(`transform="translate(0 ${height - FISSURE_EDGE_HEIGHT})"`)
  })

  test('content mode composes an upper mask with a fixed 99-unit bottom strip', () => {
    const style = createFissureMaskStyle(640, {
      top: false,
      bottom: true,
      contentBottomStrip: true
    })

    expect(style.maskImage).toContain('linear-gradient(white, white), url(')
    expect(style.maskSize).toBe(
      '100% calc(100% - var(--fissure-edge-strip-height) + 2px), 100% var(--fissure-edge-strip-height)'
    )
    expect(style.maskPosition).toBe('0 0, 0 100%')

    const svg = getMaskSvg(FISSURE_EDGE_HEIGHT, {
      top: false,
      bottom: true,
      contentBottomStrip: true
    })
    expect(svg).toContain(`viewBox="0 0 ${VIEWBOX_WIDTH} ${FISSURE_EDGE_HEIGHT}"`)
    expect(svg).toContain(`transform="translate(0 0)"`)
  })

  test('creates a full-height upper rectangle and bottom fissure without an upper path', () => {
    const svg = getMaskSvg(height, { top: false, bottom: true })

    expect(svg).toContain(
      `<rect x="0" y="0" width="${VIEWBOX_WIDTH}" height="${rectHeightWithOneEdge}" fill="white"/>`
    )
    expect(svg.split(FISSURE_EDGE_PATH)).toHaveLength(2)
    expect(svg).not.toContain(`transform="${FISSURE_TOP_TRANSFORM}"`)
    expect(svg).toContain(`transform="translate(0 ${height - FISSURE_EDGE_HEIGHT})"`)
  })
})
