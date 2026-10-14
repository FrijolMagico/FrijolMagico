import type { CSSProperties } from 'react'

import {
  FISSURE_EDGE_HEIGHT,
  FISSURE_EDGE_PATH,
  FISSURE_TOP_TRANSFORM,
  VIEWBOX_WIDTH
} from './constants'

const OVERLAP = 2

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
  /** Uses a fixed 99-unit bottom strip for naturally sized content. Default: false */
  contentBottomStrip?: boolean
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
  const rectY = hasTop ? FISSURE_EDGE_HEIGHT - OVERLAP : 0
  const rectHeight =
    hasTop && hasBottom
      ? height - FISSURE_EDGE_HEIGHT * 2 + 1 + OVERLAP * 2
      : hasTop || hasBottom
        ? height - FISSURE_EDGE_HEIGHT + 1 + OVERLAP
        : height

  let paths = ''

  if (hasTop) {
    paths += `<path d="${FISSURE_EDGE_PATH}" fill="white" transform="${FISSURE_TOP_TRANSFORM}"/>`
  }

  if (hasBottom) {
    const bottomOffset = hasContentBottomStrip
      ? 0
      : height - FISSURE_EDGE_HEIGHT
    paths += `<path d="${FISSURE_EDGE_PATH}" fill="white" transform="translate(0 ${bottomOffset})"/>`
  }

  if (hasContentBottomStrip) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_WIDTH} ${FISSURE_EDGE_HEIGHT}" preserveAspectRatio="none">${paths}</svg>`
    const stripMask = buildDataUri(svg)
    const contentMask = 'linear-gradient(white, white)'

    return {
      WebkitMaskImage: `${contentMask}, ${stripMask}`,
      maskImage: `${contentMask}, ${stripMask}`,
      WebkitMaskPosition: '0 0, 0 100%',
      maskPosition: '0 0, 0 100%',
      WebkitMaskSize:
        '100% calc(100% - var(--fissure-edge-strip-height) + 2px), 100% var(--fissure-edge-strip-height)',
      maskSize:
        '100% calc(100% - var(--fissure-edge-strip-height) + 2px), 100% var(--fissure-edge-strip-height)',
      WebkitMaskRepeat: 'no-repeat, no-repeat',
      maskRepeat: 'no-repeat'
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_WIDTH} ${height}" preserveAspectRatio="none"><rect x="0" y="${rectY}" width="${VIEWBOX_WIDTH}" height="${rectHeight}" fill="white"/>${paths}</svg>`

  return {
    WebkitMaskImage: buildDataUri(svg),
    maskImage: buildDataUri(svg),
    ...CSS_MASK_PROPS
  }
}
