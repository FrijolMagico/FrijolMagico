import { cn } from '@/utils/cn'
import {
  FISSURE_EDGE_HEIGHT,
  FISSURE_EDGE_OUTLINE_PATH,
  FISSURE_EDGE_OVERLAP,
  FISSURE_EDGE_PATH,
  FISSURE_TOP_TRANSFORM,
  VIEWBOX_WIDTH
} from './constants'

interface FissureEdgeDecorationProps {
  height: number
  bottomOffset: number
  position: 'bottom' | 'top'
  maskId: string
  blurId: string
  /** Fixed CSS height for a bottom-anchored content strip. */
  stripHeight?: string
  /** Activa animación hover (requiere grupo padre con class "group"). Default: false */
  hoverable?: boolean
}

export function FissureEdgeDecoration({
  height,
  bottomOffset,
  position,
  maskId,
  blurId,
  stripHeight,
  hoverable = false
}: FissureEdgeDecorationProps) {
  const transform =
    position === 'bottom'
      ? `translate(0 ${bottomOffset})`
      : FISSURE_TOP_TRANSFORM

  const maskRect = stripHeight
    ? position === 'bottom'
      ? { y: '0', height: String(FISSURE_EDGE_OVERLAP) }
      : {
          y: String(FISSURE_EDGE_HEIGHT - FISSURE_EDGE_OVERLAP),
          height: String(FISSURE_EDGE_OVERLAP)
        }
    : position === 'bottom'
      ? { y: '0', height: bottomOffset + 1 }
      : {
          y: String(FISSURE_EDGE_HEIGHT),
          height: height - FISSURE_EDGE_HEIGHT + 1
        }

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-10',
        stripHeight
          ? `inset-x-0 ${position === 'top' ? 'top-0' : 'bottom-0'}`
          : 'inset-0',
        hoverable && 'transition-transform duration-300 ease-out',
        hoverable &&
          position === 'bottom' &&
          'group-hover:translate-y-1',
        hoverable &&
          position === 'top' &&
          'group-hover:-translate-y-1'
      )}
      style={stripHeight ? { height: stripHeight } : undefined}
    >
      <svg
        aria-hidden='true'
        className='h-full w-full overflow-visible'
        preserveAspectRatio='none'
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
      >
        <defs>
          <mask id={maskId} maskUnits='userSpaceOnUse'>
            <rect
              x='0'
              y={maskRect.y}
              width={VIEWBOX_WIDTH}
              height={maskRect.height}
              fill='white'
            />
            <path d={FISSURE_EDGE_PATH} fill='white' transform={transform} />
          </mask>

          <filter id={blurId} x='-10%' y='-20%' width='120%' height='140%'>
            <feGaussianBlur stdDeviation='6' />
          </filter>
        </defs>

        <g mask={`url(#${maskId})`}>
          <path
            d={FISSURE_EDGE_OUTLINE_PATH}
            className='stroke-foreground/20'
            fill='none'
            strokeWidth='16'
            filter={`url(#${blurId})`}
            transform={transform}
          />
        </g>

        <path
          className='stroke-foreground'
          d={FISSURE_EDGE_OUTLINE_PATH}
          fill='none'
          strokeWidth={2}
          transform={transform}
          vectorEffect='non-scaling-stroke'
        />
      </svg>
    </div>
  )
}
