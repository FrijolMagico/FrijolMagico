import { cn } from '@/utils/utils'
import { Ticket, Music, LucideIcon } from 'lucide-react'

interface FestivalFooterStatsProps {
  talleresCount: number
  musicaCount: number
}

export const FestivalFooterStats = ({
  talleresCount,
  musicaCount,
}: FestivalFooterStatsProps) => (
  <div className='flex items-center justify-end gap-3'>
    {talleresCount > 0 && (
      <FestivalFooterStatItem
        icon={Ticket}
        label='Talleres'
        count={talleresCount}
        color={{
          bg: 'bg-fm-yellow/10',
          icon: 'text-fm-yellow',
        }}
      />
    )}
    {musicaCount > 0 && (
      <FestivalFooterStatItem
        icon={Music}
        label='Música'
        count={musicaCount}
        color={{ bg: 'bg-fm-orange/10', icon: 'text-fm-orange' }}
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
  color,
}: FestivalFooterStatItemProps) => (
  <div
    className={cn(
      'border-fm-white/20 flex max-w-42 flex-1 items-center gap-3 rounded-2xl border px-3 py-2 transition-colors',
      color.bg,
    )}>
    <div className='bg-fm-white rounded-full p-2 shadow-sm'>
      <Icon className={`h-3.5 w-3.5 ${color.icon}`} />
    </div>
    <div className='flex flex-col'>
      <strong className='text-fm-black text-lg leading-none font-black'>
        {count}
      </strong>
      <span className='text-fm-black/50 text-xs font-bold tracking-wider uppercase'>
        {label}
      </span>
    </div>
  </div>
)
