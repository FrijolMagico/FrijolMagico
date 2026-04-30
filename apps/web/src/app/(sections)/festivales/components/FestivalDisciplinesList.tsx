import { cn } from '@/utils/cn'

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
    'bg-secondary',
    'bg-primary',
    'bg-accent',
    'bg-2025-green'
  ]
}: FestivalDisciplinesListProps) => (
  <dl className='flex flex-1 flex-col justify-center gap-1'>
    {disciplines.length > 0 ? (
      disciplines.map(({ label, count }, index) => (
        <div className='flex items-center justify-between' key={label}>
          <dt className='text-foreground/60 group/item flex items-center gap-2 text-xs font-bold uppercase'>
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full transition-transform group-hover/item:scale-125',
                disciplineColors[index % disciplineColors.length]
              )}
              aria-hidden='true'
            />
            {label}
          </dt>
          <dd className='text-foreground -mt-1 ml-3.5 inline-block text-sm font-black'>
            {count}
          </dd>
        </div>
      ))
    ) : (
      <p className='text-foreground/40 text-xs'>
        Sin participaciones registradas
      </p>
    )}
  </dl>
)
