import { cn } from '@/utils/cn'
import { Ticket, Music, LucideIcon } from 'lucide-react'

interface FestivalFooterStatsProps {
  talleresCount: number
  musicaCount: number
}

export const FestivalFooterStats = ({
  talleresCount,
  musicaCount
}: FestivalFooterStatsProps) => (
  <div className='flex items-center justify-end gap-3'>
    {talleresCount > 0 && (
      <FestivalFooterStatItem
        icon={Ticket}
        label='Talleres'
        count={talleresCount}
        color={{
          bg: 'bg-accent/10',
          icon: 'text-accent'
        }}
      />
    )}
    {musicaCount > 0 && (
      <FestivalFooterStatItem
        icon={Music}
        label='Música'
        count={musicaCount}
        color={{ bg: 'bg-secondary/10', icon: 'text-secondary' }}
      />
    )}
  </div>
)

interface FestivalFooterStatItemProps {
  icon: LucideIcon
  label: string
  count: number
  color: {
    bg: string
    icon: string
  }
}

export const FestivalFooterStatItem = ({
  icon: Icon,
  label,
  count,
  color
}: FestivalFooterStatItemProps) => (
  <div
    className={cn(
      'border-background/20 flex max-w-42 flex-1 items-center gap-3 rounded-2xl border px-3 py-2 transition-colors',
      color.bg
    )}
  >
    <div className='bg-background flex-shrink-0 rounded-full p-2 shadow-sm'>
      <Icon className={`h-3.5 w-3.5 ${color.icon}`} aria-hidden='true' />
    </div>
    <div className='flex min-w-0 flex-col'>
      <dt className='sr-only'>{label}</dt>
      <dd className='text-foreground text-lg leading-none font-black'>
        {count}
      </dd>
      <span className='text-foreground/50 text-xs font-bold tracking-wider uppercase'>
        {label}
      </span>
    </div>
  </div>
)
