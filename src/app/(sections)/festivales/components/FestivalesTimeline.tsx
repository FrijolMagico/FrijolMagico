import { FestivalTimelineCard } from './FestivalTimelineCard'

import type { FestivalEdicion } from '../types/festival'
import { cn } from '@/utils/utils'

interface FestivalesTimelineProps {
  festivales: FestivalEdicion[]
}

export const FestivalesTimeline = ({ festivales }: FestivalesTimelineProps) => {
  if (festivales.length === 0) {
    return (
      <div className='py-20 text-center'>
        <p className='text-fm-black/50'>No hay festivales para mostrar.</p>
      </div>
    )
  }

  // TODO: Cambiar estrategia de maquetación, usar filas en vez de columnas, cada fila contiene 2 columnas, una para evento otra para line
  // usaremos gsap para animar el avance por la línea al hacer scroll

  return (
    <div className='relative container mx-auto px-4 py-12 [--festivals-cards-overlap:3rem]'>
      {/* Timeline items */}
      <div className='relative flex flex-col'>
        {festivales.map((festival, index) => {
          const isLeft = index % 2 === 1
          const isLast = index === festivales.length - 1

          return (
            <div
              key={`${festival.evento.slug}-${festival.evento.edicion}`}
              className='relative grid grid-cols-1 gap-x-4 lg:grid-cols-2'>
              {/* Columna izquierda - Card si index impar */}
              <div
                className={cn(
                  'hidden lg:flex lg:items-center',
                  !isLast && '-mb-(--festivals-cards-overlap)',
                )}>
                {!isLeft && (
                  <FestivalTimelineCard festival={festival} alignment='right' />
                )}
              </div>

              {/* Columna derecha - Card si index par */}
              <div
                className={cn(
                  'hidden lg:flex lg:items-center lg:justify-end',
                  !isLast && '-mb-(--festivals-cards-overlap)',
                )}>
                {isLeft && (
                  <FestivalTimelineCard festival={festival} alignment='left' />
                )}
              </div>

              {/* Mobile: Card centrada debajo del circulo */}
              <div className='flex justify-center pb-8 lg:hidden'>
                <FestivalTimelineCard festival={festival} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
