import { cn } from '@/utils/utils'
import { getDaysDisplay, getLocation } from '../utils/timelineUtils'

import type { FestivalEdicion } from '../types/festival'

import { FestivalHeader } from './FestivalHeader'
import { FestivalEventDetails } from './FestivalEventDetails'
import { FestivalExponentesCount } from './FestivalExponentesCount'
import {
  FestivalDisciplinesList,
  type Discipline,
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
}

export const FestivalTimelineCard = ({
  festival,
  alignment = 'left',
  festivalId,
  isActive = false,
  priority = false,
}: FestivalTimelineCardProps) => {
  const { evento, resumen } = festival

  const allDisciplines: Discipline[] = Object.entries(
    resumen.por_disciplina,
  ).map(([label, count]) => ({
    label,
    count: count as number,
  }))

  const daysDisplay = getDaysDisplay(evento.dias)
  const locationDisplay = getLocation(evento.dias)

  // Generate color palette for discipline dots (cycling through available colors)
  const disciplineColors = ['bg-fm-orange', 'bg-fm-green', 'bg-fm-yellow']

  return (
    <div className='relative w-full max-w-160'>
      <article
        id={festivalId}
        data-festival-id={festivalId}
        className={cn(
          'group bg-fm-white outline-fm-black/20 flex flex-col overflow-hidden rounded-3xl shadow-lg outline transition-all duration-300 outline-dashed hover:shadow-xl',
          alignment === 'right' ? 'md:flex-row-reverse' : 'md:flex-row',
        )}>
        {/* Left Panel: Info */}
        <div className='relative z-10 flex w-full flex-col justify-between p-6'>
          {/* Header Section */}
          <div className='space-y-4'>
            <FestivalHeader
              id={evento.evento_id}
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
          <div className='my-4 flex items-stretch gap-6'>
            <FestivalExponentesCount
              count={resumen.total_participantes.exponentes}
            />

            <div
              className='via-fm-black/10 w-px bg-linear-to-b from-transparent to-transparent'
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
        </div>

        {/* Right Panel: Poster Image */}
        <FestivalPoster
          posterUrl={evento.poster_url}
          nombre={evento.nombre}
          edicion={evento.edicion}
          isActive={isActive}
          priority={priority}
        />
      </article>

      <FestivalTimelineCardBacklight isActive={isActive} />
    </div>
  )
}
