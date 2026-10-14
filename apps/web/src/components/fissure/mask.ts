import type { CSSProperties } from 'react'

import {
  FISSURE_EDGE_AMPLITUDE,
  FISSURE_EDGE_HEIGHT,
  FISSURE_EDGE_OVERLAP,
  FISSURE_EDGE_PATH,
  FISSURE_TOP_TRANSFORM,
  VIEWBOX_WIDTH
} from './constants'

const CSS_MASK_PROPS = {
  WebkitMaskPosition: '0 0',
  maskPosition: '0 0',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%'
} as const

function buildDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

interface FissureMaskOptions {
  /** Includes the top fissure. Default: true */
  top?: boolean
  /** Includes the bottom fissure. Default: false */
  bottom?: boolean
  /** Uses the shared fixed-amplitude edge strip. Default: disabled */
  edgeStrip?: 'top' | 'bottom'
  /** Legacy bottom-strip option. Prefer edgeStrip. */
  contentBottomStrip?: boolean
  /** Legacy top-strip option. Prefer edgeStrip. */
  topEdgeStrip?: boolean
}

/**
 * Generates a CSS mask-image with the top fissure by default.
 * Pass `{ bottom: true }` to include the bottom edge, or `{ top: false }` for bottom-only.
 *
 * El rect blanco tiene un overlap de 2px con el path para eliminar
 * el hairline gap por anti-aliasing en WebKit/Blink.
 */
export function createFissureMaskStyle(
  height: number,
  options?: FissureMaskOptions
): CSSProperties {
  const hasTop = options?.top ?? true
  const hasBottom = options?.bottom ?? false
  const hasContentBottomStrip = options?.contentBottomStrip ?? false
  const edgeStrip =
    options?.edgeStrip ??
    (options?.topEdgeStrip ? 'top' : hasContentBottomStrip ? 'bottom' : undefined)
  const rectY = hasTop ? FISSURE_EDGE_HEIGHT - FISSURE_EDGE_OVERLAP : 0
  const rectHeight =
    hasTop && hasBottom
      ? height - FISSURE_EDGE_HEIGHT * 2 + 1 + FISSURE_EDGE_OVERLAP * 2
      : hasTop || hasBottom
        ? height - FISSURE_EDGE_HEIGHT + 1 + FISSURE_EDGE_OVERLAP
        : height

  if (edgeStrip) {
    const edgePath =
      edgeStrip === 'top'
        ? `<path d="${FISSURE_EDGE_PATH}" fill="white" transform="${FISSURE_TOP_TRANSFORM}"/>`
        : `<path d="${FISSURE_EDGE_PATH}" fill="white" transform="translate(0 0)"/>`
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_WIDTH} ${FISSURE_EDGE_HEIGHT}" preserveAspectRatio="none">${edgePath}</svg>`
    const stripMask = buildDataUri(svg)
    const contentMask = 'linear-gradient(white, white)'
    const maskSize = `100% calc(100% - var(--fissure-edge-strip-height) + ${FISSURE_EDGE_OVERLAP}px), 100% var(--fissure-edge-strip-height)`
    const maskPosition = edgeStrip === 'top' ? '0 100%, 0 0' : '0 0, 0 100%'

    return {
      WebkitMaskImage: `${contentMask}, ${stripMask}`,
      maskImage: `${contentMask}, ${stripMask}`,
      WebkitMaskPosition: maskPosition,
      maskPosition,
      WebkitMaskSize: maskSize,
      maskSize,
      WebkitMaskRepeat: 'no-repeat, no-repeat',
      maskRepeat: 'no-repeat',
      '--fissure-edge-strip-height': FISSURE_EDGE_AMPLITUDE
    } as CSSProperties
  }

  let paths = ''

  if (hasTop) {
    paths += `<path d="${FISSURE_EDGE_PATH}" fill="white" transform="${FISSURE_TOP_TRANSFORM}"/>`
  }

  if (hasBottom) {
    const bottomOffset = height - FISSURE_EDGE_HEIGHT
    paths += `<path d="${FISSURE_EDGE_PATH}" fill="white" transform="translate(0 ${bottomOffset})"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_WIDTH} ${height}" preserveAspectRatio="none"><rect x="0" y="${rectY}" width="${VIEWBOX_WIDTH}" height="${rectHeight}" fill="white"/>${paths}</svg>`

  return {
    WebkitMaskImage: buildDataUri(svg),
    maskImage: buildDataUri(svg),
    ...CSS_MASK_PROPS
  }
}
