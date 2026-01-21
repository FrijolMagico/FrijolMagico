import { Fragment } from 'react/jsx-runtime'

import { cn } from '@/utils/utils'

export interface Discipline {
  label: string
  count: number
}

interface FestivalDisciplinesListProps {
  disciplines: Discipline[]
  disciplineColors?: string[]
}

export const FestivalDisciplinesList = ({
  disciplines,
  disciplineColors = [
    'bg-fm-orange',
    'bg-fm-green',
    'bg-fm-yellow',
    'bg-2025-green',
  ],
}: FestivalDisciplinesListProps) => (
  <div className='flex flex-1 flex-col justify-center gap-1'>
    {disciplines.length > 0 ? (
      disciplines.map(({ label, count }, index) => (
        <Fragment key={label}>
          <dt className='sr-only'>{label}</dt>
          <dd className='group/item flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-transform group-hover/item:scale-125',
                  disciplineColors[index % disciplineColors.length],
                )}
                aria-hidden='true'></span>
              <span className='text-fm-black/60 text-xs font-bold tracking-wide uppercase'>
                {label}
              </span>
            </div>
            <strong className='text-fm-black text-sm font-black'>
              {count}
            </strong>
          </dd>
        </Fragment>
      ))
    ) : (
      <p className='text-fm-black/40 text-xs'>
        Sin participaciones registradas
      </p>
    )}
  </div>
)
