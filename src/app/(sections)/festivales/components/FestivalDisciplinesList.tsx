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
  <dl className='flex flex-1 flex-col justify-center gap-1'>
    {disciplines.length > 0 ? (
      disciplines.map(({ label, count }, index) => (
        <Fragment key={label}>
          <dt className='text-fm-black/60 group/item flex items-center gap-2 text-xs font-bold tracking-wide uppercase'>
            <span
              className={cn(
                'h-1.5 w-1.5 flex-shrink-0 rounded-full transition-transform group-hover/item:scale-125',
                disciplineColors[index % disciplineColors.length],
              )}
              aria-hidden='true'
            />
            {label}
          </dt>
          <dd className='text-fm-black -mt-1 ml-3.5 text-sm font-black'>
            {count}
          </dd>
        </Fragment>
      ))
    ) : (
      <p className='text-fm-black/40 text-xs'>
        Sin participaciones registradas
      </p>
    )}
  </dl>
)
