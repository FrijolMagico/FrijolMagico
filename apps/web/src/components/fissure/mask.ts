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
  /** Si es true, incluye el borde fisurado inferior además del superior. Default: false */
  bottom?: boolean
}

/**
 * Genera un CSS mask-image con el borde superior fisurado.
 * Opcionalmente incluye el borde inferior pasando `{ bottom: true }`.
 *
 * El rect blanco tiene un overlap de 2px con el path para eliminar
 * el hairline gap por anti-aliasing en WebKit/Blink.
 */
export function createFissureMaskStyle(
  height: number,
  options?: FissureMaskOptions
): CSSProperties {
  const hasBottom = options?.bottom ?? false
  const rectY = FISSURE_EDGE_HEIGHT - OVERLAP
  const rectHeight = hasBottom
    ? height - FISSURE_EDGE_HEIGHT * 2 + 1 + OVERLAP * 2
    : height - FISSURE_EDGE_HEIGHT + 1 + OVERLAP

  let paths = `<path d="${FISSURE_EDGE_PATH}" fill="white" transform="${FISSURE_TOP_TRANSFORM}"/>`

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
