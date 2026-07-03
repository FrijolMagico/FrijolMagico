import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import type { AdjacentFestival } from '../lib/getAdjacentFestivals'

// ——— Sub-component ———

interface NavigatorCardProps {
  festival: AdjacentFestival
  direction: 'prev' | 'next'
}

const NavigatorCard = ({ festival, direction }: NavigatorCardProps) => {
  const Arrow = direction === 'prev' ? ArrowLeft : ArrowRight
  const href = `/festivales/${festival.slug}`
  const isPrev = direction === 'prev'

  return (
    <Link
      href={href}
      className='group relative rounded-lg border-2 border-primary bg-background'
    >
      {/* Backlight — same pattern as ActivityItem */}
      <div className='absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg bg-primary transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0' />

      <div className='flex items-center gap-3 p-4'>
        {isPrev && (
          <ArrowLeft
            className='size-5 shrink-0 text-primary'
            aria-hidden='true'
          />
        )}

        <div className='min-w-0 flex-1'>
          <p className='text-lg leading-tight font-bold text-primary'>
            {festival.numero_edicion} {festival.evento_nombre}
          </p>
          {festival.edicion_nombre && (
            <p className='text-sm font-semibold text-accent'>
              {festival.edicion_nombre}
            </p>
          )}
        </div>

        {!isPrev && (
          <ArrowRight
            className='size-5 shrink-0 text-primary'
            aria-hidden='true'
          />
        )}
      </div>
    </Link>
  )
}

// ——— Main component ———

interface FestivalNavigatorProps {
  prev: AdjacentFestival | null
  next: AdjacentFestival | null
}

export const FestivalNavigator = ({
  prev,
  next
}: FestivalNavigatorProps) => {
  if (!prev && !next) return null

  return (
    <nav
      className='container mx-auto max-w-6xl px-4 pb-32'
      aria-label='Navegación entre ediciones'
    >
      <h2 className='mb-6 text-2xl font-bold text-foreground'>
        Más festivales
      </h2>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {prev ? (
          <NavigatorCard festival={prev} direction='prev' />
        ) : (
          <div aria-hidden='true' />
        )}
        {next ? (
          <NavigatorCard festival={next} direction='next' />
        ) : (
          <div aria-hidden='true' />
        )}
      </div>
    </nav>
  )
}
