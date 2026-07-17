import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import {
  getAdjacentFestivals,
  type AdjacentFestival
} from '../lib/getAdjacentFestivals'

// ——— Sub-component ———

interface NavigatorCardProps {
  festival: AdjacentFestival
  direction: 'prev' | 'next'
}

const NavigatorCard = ({ festival, direction }: NavigatorCardProps) => {
  const href = `/festivales/${festival.slug}`
  const isPrev = direction === 'prev'

  return (
    <Link
      href={href}
      className='group border-palette-foreground bg-palette-primary relative rounded-lg border'
    >
      {/* Backlight — same pattern as ActivityItem */}
      <div className='bg-foreground absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0' />

      <div className='flex items-center gap-3 p-4'>
        {isPrev && (
          <ArrowLeft
            className='text-palette-background size-5 shrink-0'
            aria-hidden='true'
          />
        )}

        <div className='min-w-0 flex-1'>
          <p className='text-palette-background text-lg leading-none font-bold'>
            {festival.evento_nombre}{' '}
            <span className='text-palette-secondary'>
              {festival.numero_edicion}
            </span>
          </p>
          {festival.edicion_nombre && (
            <p className='text-palette-accent text-sm font-semibold'>
              {festival.edicion_nombre}
            </p>
          )}
        </div>

        {!isPrev && (
          <ArrowRight
            className='text-palette-background size-5 shrink-0'
            aria-hidden='true'
          />
        )}
      </div>
    </Link>
  )
}

// ——— Main component ———

interface FestivalNavigatorProps {
  slug: string
}

export const FestivalNavigator = async ({ slug }: FestivalNavigatorProps) => {
  if (!slug) return null

  const { prev, next } = await getAdjacentFestivals(slug)
  if (!prev && !next) return null

  return (
    <nav
      className='container mx-auto max-w-6xl'
      aria-label='Navegación entre ediciones'
    >
      <h2 className='text-palette-primary mb-6 w-full text-center text-4xl font-bold md:text-start'>
        Otras ediciones
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
