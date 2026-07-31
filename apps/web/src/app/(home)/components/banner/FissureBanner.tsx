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

const DEFAULT_LANDSCAPE_HEIGHT = 640
const DEFAULT_COMPACT_HEIGHT = 840

interface FissureBannerProps {
  children?: ReactNode
  className?: string
  contentClassName?: string
  landscapeHeight?: number
  compactHeight?: number
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

function FissureBannerLayout({
  children,
  className,
  contentClassName,
  height,
  palette,
  aspectSquare
}: FissureBannerProps & {
  height: number
  palette: string
  aspectSquare?: boolean
}) {
  const baseId = useId().replace(/:/g, '')
  const bottomMaskId = `${baseId}-bottom-mask`
  const bottomBlurId = `${baseId}-bottom-blur`
  const topMaskId = `${baseId}-top-mask`
  const topBlurId = `${baseId}-top-blur`
  const bottomOffset = height - FISSURE_EDGE_HEIGHT
  const maskStyle = createFissureMaskStyle(height, { bottom: true })

  return (
    <header
      className={cn(
        'relative w-full overflow-hidden',
        aspectSquare && 'aspect-square',
        className
      )}
      style={aspectSquare ? undefined : { height }}
    >
      <div
        className={cn(
          'relative left-1/2 w-screen min-w-7xl -translate-x-1/2',
          aspectSquare && 'h-full'
        )}
        style={aspectSquare ? undefined : { height }}
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

export function FissureBanner({
  children,
  className,
  contentClassName,
  landscapeHeight = DEFAULT_LANDSCAPE_HEIGHT,
  compactHeight,
  palette = 'base'
}: FissureBannerProps) {
  if (compactHeight === undefined) {
    return (
      <FissureBannerLayout
        className={className}
        contentClassName={contentClassName}
        height={landscapeHeight}
        palette={palette}
      >
        {children}
      </FissureBannerLayout>
    )
  }

  return (
    <>
      <div className='max-[820px]:hidden portrait:hidden'>
        <FissureBannerLayout
          className={className}
          contentClassName={contentClassName}
          height={landscapeHeight}
          palette={palette}
        >
          {children}
        </FissureBannerLayout>
      </div>
      <div className='hidden max-[820px]:block portrait:block'>
        <FissureBannerLayout
          aspectSquare
          className={className}
          contentClassName={contentClassName}
          height={compactHeight}
          palette={palette}
        >
          {children}
        </FissureBannerLayout>
      </div>
    </>
  )
}
