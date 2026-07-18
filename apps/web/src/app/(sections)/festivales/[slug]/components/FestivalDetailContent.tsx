import { Calendar, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'

import { FestivalDetailPoster } from './FestivalDetailPoster'
import { FestivalPosterTransition } from '@/components/transitions/FestivalPosterTransition'
import { ParticipantList } from './ParticipantList'
import { ActivityList } from './ActivityList'

import { getDaysDisplay, getLocation } from '../../utils/timelineUtils'

import type { FestivalDetail } from '../../types/festival'

interface FestivalDetailContentProps {
  detail: FestivalDetail
  navigator?: ReactNode
  animationMode?: 'active'
  palette?: string
}

export const FestivalDetailContent = ({
  detail,
  navigator,
  animationMode,
  palette = 'base'
}: FestivalDetailContentProps) => {
  const { evento, edicion_nombre, numero_edicion, poster_url, dias } = detail

  const daysDisplay = getDaysDisplay(dias)
  const locationDisplay = getLocation(dias)

  return (
    <article
      data-palette={palette}
      className='container mx-auto max-w-6xl px-4 pt-24 pb-32'
    >
      <header
        className='mb-8'
        data-festival-entry={animationMode === 'active' ? 'header' : undefined}
      >
        {animationMode === 'active' ? (
          <h1 className='text-palette-primary text-4xl leading-none font-black tracking-tight md:text-5xl'>
            <span className='text-palette-secondary'>{numero_edicion}</span>{' '}
            {evento.nombre}
          </h1>
        ) : (
          <h1 className='text-palette-primary text-4xl leading-none font-black tracking-tight md:text-5xl'>
            {evento.nombre}{' '}
            <span className='text-palette-secondary'>{numero_edicion}</span>
          </h1>
        )}
        {edicion_nombre && (
          <p className='text-palette-accent text-xl font-semibold'>
            {edicion_nombre}
          </p>
        )}

        <div className='mt-4 space-y-2'>
          {daysDisplay && (
            <div className='text-palette-foreground/70 flex items-center gap-2'>
              <Calendar className='size-5' aria-hidden='true' />
              <span>{daysDisplay}</span>
            </div>
          )}
          {locationDisplay && (
            <div className='text-palette-foreground/70 flex items-center gap-2'>
              <MapPin className='size-5' aria-hidden='true' />
              <span>{locationDisplay}</span>
            </div>
          )}
        </div>
      </header>

      <div className='grid gap-10 md:grid-cols-8 lg:gap-20'>
        <aside className='md:sticky md:top-24 md:col-span-3 md:self-start'>
          {animationMode === 'active' ? (
            <FestivalDetailPoster
              posterUrl={poster_url}
              eventName={evento.nombre}
              editionName={numero_edicion}
              priority
              animationMode={animationMode}
            />
          ) : (
            <FestivalPosterTransition slug={detail.slug}>
              <FestivalDetailPoster
                posterUrl={poster_url}
                eventName={evento.nombre}
                editionName={numero_edicion}
                priority
                animationMode={animationMode}
              />
            </FestivalPosterTransition>
          )}
        </aside>

        <div className='min-w-0 space-y-8 md:col-span-5'>
          <ParticipantList
            participantes={detail.participantes}
            animationMode={animationMode}
          />
          {detail.actividades.length > 0 && (
            <ActivityList actividades={detail.actividades} />
          )}
          {navigator && <div className='pt-10'>{navigator}</div>}
        </div>
      </div>
    </article>
  )
}
