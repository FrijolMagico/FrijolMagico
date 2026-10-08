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
      className='container mx-auto max-w-6xl space-y-24 px-4 pt-24 pb-32'
    >
      <div className='space-y-8'>
        <header
          data-festival-entry={
            animationMode === 'active' ? 'header' : undefined
          }
        >
          <h1 className='text-palette-primary text-4xl leading-none font-black tracking-tight md:text-7xl'>
            {evento.nombre}{' '}
            <span className='text-palette-secondary uppercase'>
              {numero_edicion}
            </span>
          </h1>

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

        <div className='relative flex flex-col gap-10 md:flex-row'>
          <aside className='w-full max-w-92.5 md:w-92.5 md:shrink-0 md:self-stretch'>
            <div className='relative aspect-370/523 w-full md:sticky md:top-24'>
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
            </div>
          </aside>

          <div className='min-w-0'>
            <ParticipantList
              participantes={detail.participantes}
              animationMode={animationMode}
            />
          </div>
        </div>
      </div>

      {detail.actividades.length > 0 && (
        <ActivityList
          actividades={detail.actividades}
          isEditionPast={detail.is_edition_past}
        />
      )}
      {navigator && <div className='mt-10'>{navigator}</div>}
    </article>
  )
}
