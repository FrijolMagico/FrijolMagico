import { type CSSProperties, type ReactNode } from 'react'

import { cn } from '@/utils/cn'
import {
  FISSURE_EDGE_AMPLITUDE,
  FISSURE_EDGE_HEIGHT,
  FISSURE_EDGE_PATH,
  VIEWBOX_WIDTH
} from '@/components/fissure/constants'
import {
  FISSURE_CANVAS_LEFT,
  FISSURE_CANVAS_WIDTH,
  FissureSurface
} from '@/components/fissure/fissure-surface'

const COMPACT_GEOMETRY_HEIGHT = 840

type FissureBannerSizing =
  | { sizing: 'square' }
  | { sizing: 'fixed'; height: number }

interface FissureBannerProps {
  children?: ReactNode
  className?: string
  contentClassName?: string
  landscape: FissureBannerSizing
  compact: FissureBannerSizing
  palette?: string
}

function FissureClickBlocker() {
  const blockerPath = `M0 0 H${VIEWBOX_WIDTH} V${FISSURE_EDGE_HEIGHT} H0 Z ${FISSURE_EDGE_PATH}`

  return (
    <svg
      aria-hidden='true'
      className='pointer-events-none absolute inset-x-0 bottom-0 z-50 h-full w-full overflow-visible'
      style={{ height: FISSURE_EDGE_AMPLITUDE }}
      preserveAspectRatio='none'
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${FISSURE_EDGE_HEIGHT}`}
    >
      <path
        className='pointer-events-auto cursor-auto'
        d={blockerPath}
        fill='transparent'
        fillRule='evenodd'
        transform='translate(0 0)'
      />
    </svg>
  )
}

function FissureBannerLayout({
  children,
  className,
  contentClassName,
  sizing,
  palette
}: Omit<FissureBannerProps, 'landscape' | 'compact'> & {
  sizing: FissureBannerSizing
}) {
  const isSquare = sizing.sizing === 'square'
  const height = isSquare ? COMPACT_GEOMETRY_HEIGHT : sizing.height
  const frameStyle: CSSProperties = {
    height: isSquare ? undefined : sizing.height
  }
  const fixedContentStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: FISSURE_CANVAS_LEFT,
    width: FISSURE_CANVAS_WIDTH,
    height: isSquare ? '100vw' : height
  }

  return (
    <header
      className={cn(
        'relative w-full overflow-hidden',
        isSquare && 'aspect-square',
        className
      )}
      style={frameStyle}
    >
      <FissureSurface
        geometryHeight={height}
        height={isSquare ? '100vw' : height}
        edge='bottom'
        overlay={
          <FissureClickBlocker />
        }
      >
        <div
          data-palette={palette}
          className={cn(
            'flex h-full w-full items-center justify-center',
            contentClassName
          )}
          style={fixedContentStyle}
        >
          {children}
        </div>
      </FissureSurface>
    </header>
  )
}

export function FissureBanner({
  children,
  className,
  contentClassName,
  landscape,
  compact,
  palette = 'base'
}: FissureBannerProps) {
  const landscapeLayout = { sizing: landscape }
  const compactLayout = { sizing: compact }

  return (
    <>
      <div className='hidden md:block'>
        <FissureBannerLayout
          className={className}
          contentClassName={contentClassName}
          palette={palette}
          {...landscapeLayout}
        >
          {children}
        </FissureBannerLayout>
      </div>
      <div className='md:hidden'>
        <FissureBannerLayout
          className={className}
          contentClassName={contentClassName}
          palette={palette}
          {...compactLayout}
        >
          {children}
        </FissureBannerLayout>
      </div>
    </>
  )
}
