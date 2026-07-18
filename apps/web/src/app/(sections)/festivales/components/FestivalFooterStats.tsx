import { cn } from '@/utils/cn'
import { Mic, Music, Paintbrush, type LucideIcon } from 'lucide-react'

interface FestivalFooterStatsProps {
  talleresCount: number
  musicaCount: number
}

export const FestivalFooterStats = ({
  talleresCount,
  musicaCount
}: FestivalFooterStatsProps) => (
  <div className='flex items-center gap-3'>
    {talleresCount > 0 && (
      <FestivalFooterStatItem
        icon={Mic}
        label='Talleres'
        count={talleresCount}
        color={{
          bg: 'bg-accent/5',
          icon: 'text-accent'
        }}
      />
    )}

    {musicaCount > 0 && (
      <FestivalFooterStatItem
        icon={Music}
        label='Bandas'
        count={musicaCount}
        color={{ bg: 'bg-secondary/5', icon: 'text-secondary' }}
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
      'border-foreground/10 group/category relative mx-auto flex-1 rounded-2xl border border-dashed px-3 py-2 transition-colors',
      color.bg
    )}
  >
    <div className='bg-primary text-background absolute -top-2/5 right-0 left-0 mx-auto w-fit rounded-full px-2 py-1 text-xs leading-none opacity-0 transition-opacity duration-200 group-hover/category:opacity-100'>
      {label}
    </div>
    <div className='mx-auto flex w-fit flex-1 shrink-0 items-center gap-3'>
      <Icon className={`h-3.5 w-3.5 ${color.icon}`} aria-hidden='true' />
      <dt className='sr-only'>{label}</dt>
      <dd className='text-foreground leading-none font-bold'>{count}</dd>
    </div>
  </div>
)
