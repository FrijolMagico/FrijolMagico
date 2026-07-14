import { useId, type ReactNode } from 'react'

import { cn } from '@/utils/cn'
import { FissureEdgeDecoration } from '@/components/fissure/FissureEdgeDecoration'
import {
  FISSURE_EDGE_HEIGHT,
  FISSURE_EDGE_PATH,
  FISSURE_TOP_TRANSFORM,
  VIEWBOX_WIDTH
} from '@/components/fissure/constants'
import { createFissureMaskStyle } from '@/components/fissure/mask'

const DEFAULT_HEIGHT = 600

interface FissureBannerProps {
  children?: ReactNode
  className?: string
  contentClassName?: string
  height?: number
  palette?: string
}

interface FissureEdgeLayoutProps {
  height: number
  bottomOffset: number
  position: 'bottom' | 'top'
}

function FissureClickBlocker({
  height,
  bottomOffset,
  position
}: FissureEdgeLayoutProps) {
  const transform =
    position === 'bottom'
      ? `translate(0 ${bottomOffset})`
      : FISSURE_TOP_TRANSFORM

  const blockerPath = `M0 0 H${VIEWBOX_WIDTH} V${FISSURE_EDGE_HEIGHT} H0 Z ${FISSURE_EDGE_PATH}`

  return (
    <svg
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-50 h-full w-full overflow-visible'
      preserveAspectRatio='none'
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
    >
      <path
        className='pointer-events-auto cursor-auto'
        d={blockerPath}
        fill='transparent'
        fillRule='evenodd'
        transform={transform}
      />
    </svg>
  )
}

export function FissureBanner({
  children,
  className,
  contentClassName,
  height = DEFAULT_HEIGHT,
  palette = 'base'
}: FissureBannerProps) {
  const baseId = useId().replace(/:/g, '')
  const bottomMaskId = `${baseId}-bottom-mask`
  const bottomBlurId = `${baseId}-bottom-blur`
  const topMaskId = `${baseId}-top-mask`
  const topBlurId = `${baseId}-top-blur`
  const bottomOffset = height - FISSURE_EDGE_HEIGHT
  const maskStyle = createFissureMaskStyle(height, { bottom: true })

  return (
    <header
      className={cn('relative w-full overflow-hidden', className)}
      style={{ height }}
    >
      <div
        className='relative left-1/2 w-screen min-w-7xl -translate-x-1/2'
        style={{ height }}
      >
        <div
          className='bg-background absolute inset-0 overflow-hidden'
          style={maskStyle}
        >
          <div
            data-palette={palette}
            className={cn(
              'relative z-0 flex h-full w-full items-center justify-center',
              contentClassName
            )}
          >
            {children}
          </div>
        </div>

        <FissureEdgeDecoration
          position='bottom'
          blurId={bottomBlurId}
          maskId={bottomMaskId}
          height={height}
          bottomOffset={bottomOffset}
        />
        <FissureEdgeDecoration
          position='top'
          blurId={topBlurId}
          maskId={topMaskId}
          height={height}
          bottomOffset={bottomOffset}
        />
        <FissureClickBlocker
          position='bottom'
          height={height}
          bottomOffset={bottomOffset}
        />
        <FissureClickBlocker
          position='top'
          height={height}
          bottomOffset={bottomOffset}
        />
      </div>
    </header>
  )
}
