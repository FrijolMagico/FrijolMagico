import { FestivalTimelineCard } from './FestivalTimelineCard'
import { TimelineConnector } from './TimelineConnector'
import { FestivalsSidebarNav } from './FestivalsSidebarNav'

import type { FestivalEdicion } from '../types/festival'
import { cn } from '@/utils/utils'

interface FestivalesTimelineContentProps {
  festivales: FestivalEdicion[]
  activeId: string | null
}

export const FestivalesTimelineContent = ({
  festivales,
  activeId,
}: FestivalesTimelineContentProps) => {
  if (festivales.length === 0) {
    return (
      <div className='py-20 text-center'>
        <p className='text-fm-black/50'>No hay festivales para mostrar.</p>
      </div>
    )
  }

  // Generate nav items for sidebar
  const navItems = festivales.map((f) => ({
    id: `festival-${f.evento.evento_id}-${f.evento.edicion}`,
    nombre: f.evento.nombre,
    edicion: f.evento.edicion,
    eventoId: f.evento.evento_id,
    year: new Date(f.evento.dias[0].fecha).getFullYear(),
  }))

  return (
    <div className='relative mx-auto px-4 py-24'>
      <div className='lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12'>
        {/* Sidebar - CLIENT component */}
        <aside className='hidden pt-61 lg:block'>
          <FestivalsSidebarNav items={navItems} />
        </aside>

        {/* Timeline items */}
        <div className='relative flex flex-col items-center'>
          <div className='relative grid gap-8 lg:grid-cols-[40rem_40rem]'>
            {/* Superior indicator */}
            <div className='flex flex-col items-center'>
              <div className='bg-fm-orange/10 text-fm-orange relative mx-auto flex size-32 flex-col items-center justify-center rounded-full'>
                <span className='font-josefin landing-0 block text-3xl font-black'>
                  {new Date().getFullYear()}
                </span>
                <span className='block text-center leading-0'>y más...</span>
              </div>

              <svg
                className='h-30'
                viewBox={`0 0 20 120`}
                preserveAspectRatio='none'>
                <path
                  fill='none'
                  strokeWidth={6}
                  strokeDasharray='20,10'
                  className='stroke-fm-orange'
                  d='M 10 0 L 10 200'
                />
              </svg>
            </div>
            <div hidden></div>
          </div>
          {festivales.map((festival, index) => {
            const isLeft = index % 2 === 1
            const isLast = index === festivales.length - 1
            const connectorColor =
              festival.evento.evento_id === 1
                ? 'stroke-fm-orange'
                : 'stroke-fm-green'
            const festivalId = `festival-${festival.evento.evento_id}-${festival.evento.edicion}`
            const isActive = activeId === festivalId
            return (
              <div
                key={`${festival.evento.slug}-${festival.evento.edicion}`}
                className='relative grid grid-cols-1 gap-8 lg:grid-cols-[40rem_40rem]'>
                {/* Columna izquierda - Card si index impar */}
                <div
                  className={cn(
                    'hidden justify-center lg:flex lg:items-center',
                    !isLast && '',
                  )}>
                  {!isLeft ? (
                    <FestivalTimelineCard
                      festival={festival}
                      alignment='right'
                      festivalId={festivalId}
                      isActive={isActive}
                    />
                  ) : !isLast ? (
                    <TimelineConnector color={connectorColor} toLeft />
                  ) : null}
                </div>

                {/* Columna derecha - Card si index par */}
                <div
                  className={cn(
                    'hidden lg:flex lg:items-center lg:justify-end',
                    !isLast && '',
                  )}>
                  {isLeft ? (
                    <FestivalTimelineCard
                      festival={festival}
                      alignment='left'
                      festivalId={festivalId}
                      isActive={isActive}
                    />
                  ) : !isLast ? (
                    <TimelineConnector color={connectorColor} />
                  ) : null}
                </div>

                {/* Mobile: Card centrada debajo del circulo */}
                <div className='flex justify-center pb-12 lg:hidden'>
                  <FestivalTimelineCard
                    festival={festival}
                    festivalId={festivalId}
                    isActive={isActive}
                  />
                </div>
              </div>
            )
          })}

          <div className='relative grid gap-8 lg:grid-cols-[40rem_40rem]'>
            <div aria-hidden className='block size-full'></div>
            <div className='flex flex-col items-center'>
              <svg
                className='h-30'
                viewBox={`0 0 20 120`}
                preserveAspectRatio='none'>
                <path
                  fill='none'
                  strokeWidth={6}
                  strokeDasharray='20,10'
                  className='stroke-fm-green'
                  d='M 10 0 L 10 200'
                />
              </svg>
              <div className='bg-fm-green/10 text-fm-green relative mx-auto flex size-32 flex-col items-center justify-center rounded-full'>
                <span className='font-josefin landing-0 block text-3xl font-black'>
                  2016
                </span>
                <span className='block text-center leading-none'>
                  La historia comienza
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
