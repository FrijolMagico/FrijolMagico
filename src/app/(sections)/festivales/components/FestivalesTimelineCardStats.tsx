import { cn } from 'tailwind-variants'

interface FestivalesTimelineCardStatsProps {
  label: string
  stat: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'orange' | 'white' | 'black' | 'yellow' | 'green'
}

const colorClasses = {
  orange: 'bg-fm-orange text-fm-white',
  white: 'bg-fm-white text-fm-black',
  black: 'bg-fm-black text-fm-white',
  yellow: 'bg-fm-yellow text-fm-black',
  green: 'bg-fm-green text-fm-white',
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
}

export const FestivalesTimelineCardStats = ({
  stat,
  label,
  color = 'orange',
  size = 'lg',
}: FestivalesTimelineCardStatsProps) => {
  return (
    stat > 0 && (
      <li
        className={cn(
          'flex aspect-square items-center justify-center gap-2 rounded-full',
          sizeClasses[size],
          colorClasses[color],
        )}>
        <span className='flex flex-col items-center text-sm leading-none'>
          <strong className='text-4xl leading-none'>{stat}</strong>
          {label}
        </span>
      </li>
    )
  )
}
