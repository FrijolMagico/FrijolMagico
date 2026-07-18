import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

import { cn } from '@/utils/cn'
import { getDaysDisplay, getLocation } from '../utils/timelineUtils'

import type { FestivalEdicion } from '../types/festival'

import { FestivalHeader } from './FestivalHeader'
import { FestivalEventDetails } from './FestivalEventDetails'
import { FestivalPosterTransition } from '@/components/transitions/FestivalPosterTransition'
import { FestivalExponentesCount } from './FestivalExponentesCount'
import {
  FestivalDisciplinesList,
  type Discipline
} from './FestivalDisciplinesList'
import { FestivalPoster } from './FestivalPoster'
import { FestivalFooterStats } from './FestivalFooterStats'
import { FestivalTimelineCardBacklight } from './FestivalTimelineCardBacklight'

interface FestivalTimelineCardProps {
  festival: FestivalEdicion
  alignment?: 'left' | 'right'
  festivalId?: string
  isActive?: boolean
  priority?: boolean
  enableViewTransition?: boolean
}

export const FestivalTimelineCard = ({
  festival,
  alignment = 'left',
  festivalId,
  isActive = false,
  priority = false,
  enableViewTransition = false
}: FestivalTimelineCardProps) => {
  const { evento, resumen } = festival

  const allDisciplines: Discipline[] = Object.entries(
    resumen.por_disciplina
  ).map(([label, count]) => ({
    label,
    count: count as number
  }))

  const daysDisplay = getDaysDisplay(evento.dias)
  const locationDisplay = getLocation(evento.dias)

  // Generate color palette for discipline dots (cycling through available colors)
  const disciplineColors = ['bg-secondary', 'bg-primary', 'bg-accent']

  return (
    <div className='group/card relative w-full max-w-125 md:landscape:max-h-85 lg:landscape:h-full'>
      <article
        id={festivalId}
        data-festival-id={festivalId}
        className={cn(
          'group bg-background relative z-10 flex w-full flex-col rounded-3xl transition-all duration-300 group-hover/card:scale-[1.01] md:flex-row',
          alignment === 'right' && 'lg:landscape:flex-row-reverse'
        )}
      >
        {/* Right Panel: Poster Image */}
        <FestivalPosterTransition
          slug={festival.evento.edicion_slug}
          enabled={enableViewTransition}
        >
          <FestivalPoster
            posterUrl={evento.poster_url}
            nombre={evento.nombre}
            edicion={evento.edicion}
            isActive={isActive}
            priority={priority}
          />
        </FestivalPosterTransition>

        {/* Left Panel: Info */}
        <div className='relative z-10 flex w-full flex-col justify-between gap-4 p-6 lg:gap-0'>
          {/* Header Section */}
          <div className='space-y-2'>
            <FestivalHeader
              nombre={evento.nombre}
              edicion={evento.edicion}
              edicionNombre={evento.edicion_nombre}
            />

            <FestivalEventDetails
              daysDisplay={daysDisplay}
              locationDisplay={locationDisplay}
            />
          </div>

          {/* Middle Stats Section */}
          <div className='flex gap-2'>
            <FestivalExponentesCount
              count={resumen.total_participantes.exponentes}
            />

            <div
              className='via-foreground/10 w-px bg-linear-to-b from-transparent to-transparent'
              aria-hidden='true'
            />

            <FestivalDisciplinesList
              disciplines={allDisciplines}
              disciplineColors={disciplineColors}
            />
          </div>

          <FestivalFooterStats
            talleresCount={resumen.total_participantes.talleres}
            musicaCount={resumen.total_participantes.musica}
          />

          {/* Bottom link button */}
          <Link
            href={`/festivales/${festival.evento.edicion_slug}`}
            className={cn('group/btn relative z-20')}
          >
            {/* Plain bg effect — same pattern as ArtistCard */}
            <div className='bg-primary absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg transition-transform duration-300 group-hover/btn:translate-x-0 group-hover/btn:translate-y-0' />
            <span className='border-primary bg-background text-primary group-hover/btn:bg-primary group-hover/btn:text-background relative flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-1 font-semibold transition-colors duration-200'>
              Ver más
              <ArrowRightIcon className='size-4 transition-transform duration-200 group-hover/btn:-rotate-45' />
            </span>
          </Link>
        </div>
      </article>

      <FestivalTimelineCardBacklight isActive={isActive} />
    </div>
  )
}
