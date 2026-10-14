import { useId, type CSSProperties, type ReactNode } from 'react'

import { FissureEdgeDecoration } from './FissureEdgeDecoration'
import { FISSURE_EDGE_AMPLITUDE, FISSURE_EDGE_HEIGHT } from './constants'
import { createFissureMaskStyle } from './mask'

export const FISSURE_CANVAS_WIDTH = 'max(100vw, 80rem)'
export const FISSURE_CANVAS_LEFT = 'min(0px, calc((100vw - 80rem) / 2))'

interface FissureSurfaceProps {
  children?: ReactNode
  geometryHeight: number
  height?: CSSProperties['height']
  edge: 'top' | 'bottom'
  overlay?: ReactNode
  sizing?: 'frame' | 'natural' | 'fixed-frame'
  surfaceClassName?: string
}

/** Shared masked canvas and contour composition; callers own their frame and sizing policy. */
export function FissureSurface({
  children,
  geometryHeight,
  height,
  edge,
  overlay,
  sizing = 'frame',
  surfaceClassName = 'bg-background'
}: FissureSurfaceProps) {
  const baseId = useId().replace(/:/g, '')
  const maskId = `${baseId}-mask`
  const blurId = `${baseId}-blur`
  const canvasStyle: CSSProperties = {
    width: FISSURE_CANVAS_WIDTH,
    left: FISSURE_CANVAS_LEFT
  }
  const naturalHeight = sizing === 'natural'
  const maskStyle: CSSProperties = {
    ...(!naturalHeight ? canvasStyle : { width: FISSURE_CANVAS_WIDTH }),
    ...createFissureMaskStyle(geometryHeight, {
      top: edge === 'top',
      bottom: edge === 'bottom',
      edgeStrip: edge
    }),
    height
  }
  const decoration = (
    <FissureEdgeDecoration
      position={edge}
      blurId={blurId}
      maskId={maskId}
      height={FISSURE_EDGE_HEIGHT}
      bottomOffset={0}
      stripHeight={FISSURE_EDGE_AMPLITUDE}
    />
  )

  if (naturalHeight) {
    return (
      <div className='relative' style={canvasStyle}>
        <div
          className={`${surfaceClassName} relative overflow-hidden`}
          style={maskStyle}
        >
          {children}
        </div>
        <div className='pointer-events-none absolute inset-0'>
          {decoration}
          {overlay}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`${surfaceClassName} absolute top-0 overflow-hidden`}
        style={maskStyle}
      >
        {children}
      </div>
      <div className='pointer-events-none absolute inset-0' style={canvasStyle}>
        {decoration}
        {overlay}
      </div>
    </>
  )
}
