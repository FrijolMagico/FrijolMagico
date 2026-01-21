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
  <div className='flex items-center gap-3'>
    {talleresCount > 0 && (
      <FestivalFooterStatItem
        icon={Ticket}
        label='Talleres'
        count={talleresCount}
        bgColor='bg-fm-yellow/10'
        iconColor='text-fm-orange'
      />
    )}
    {musicaCount > 0 && (
      <FestivalFooterStatItem
        icon={Music}
        label='Música'
        count={musicaCount}
        bgColor='bg-2025-pink/10'
        iconColor='text-2025-pink'
      />
    )}
  </div>
)

interface FestivalFooterStatItemProps {
  icon: LucideIcon
  label: string
  count: number
  bgColor: string
  iconColor: string
}

export const FestivalFooterStatItem = ({
  icon: Icon,
  label,
  count,
  bgColor,
  iconColor,
}: FestivalFooterStatItemProps) => (
  <div
    className={cn(
      'border-fm-white/20 flex flex-1 items-center gap-3 rounded-2xl border px-3 py-2 transition-colors',
      bgColor,
    )}>
    <div className='bg-fm-white rounded-full p-2 shadow-sm'>
      <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
    </div>
    <div className='flex flex-col'>
      <span className='text-fm-black/50 text-xs font-bold tracking-wider uppercase'>
        {label}
      </span>
      <strong className='text-fm-black text-lg leading-none font-black'>
        {count}
      </strong>
    </div>
  </div>
)
