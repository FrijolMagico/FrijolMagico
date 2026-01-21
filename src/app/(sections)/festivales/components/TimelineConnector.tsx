import { cn } from '@/utils/utils'

interface TimelineConnectorProps {
  toLeft?: boolean
  strokeWidth?: number
  dashArray?: string
  curveRadius?: number
  color?: string
  width?: number
  height?: number
}

export const TimelineConnector = ({
  toLeft = false,
  strokeWidth = 6,
  dashArray = '20,10',
  curveRadius = 24,
  color = 'stroke-fm-yellow',
  width = 640,
  height = 400,
}: TimelineConnectorProps) => {
  const pathData =
    toLeft === false
      ? `
        M 0 ${height / 2}
        L ${width / 2 - curveRadius} ${height / 2}
        Q ${width / 2} ${height / 2}, ${width / 2} ${height / 2 + curveRadius}
        L ${width / 2} ${height}
      `
      : `
        M ${width} ${height / 2}
        L ${width / 2 + curveRadius} ${height / 2}
        Q ${width / 2} ${height / 2}, ${width / 2} ${height / 2 + curveRadius}
        L ${width / 2} ${height}
      `

  return (
    <div
      className={cn(
        '-z-10 size-full',
        toLeft ? 'translate-x-8' : '-translate-x-8',
      )}>
      <svg
        className='size-full'
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio='none'>
        <path
          fill='none'
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          className={color}
          d={pathData}
        />
      </svg>
    </div>
  )
}
