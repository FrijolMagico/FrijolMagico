import Image from 'next/image'
// import Link from 'next/link'
import { Calendar, MapPin, Users, Music, Wrench } from 'lucide-react'

import { cn } from '@/utils/utils'
import { getDaysDisplay, getLocation } from '../utils/timelineUtils'

import type { FestivalEdicion } from '../types/festival'
import { FestivalesTimelineCardStats } from './FestivalesTimelineCardStats'

interface FestivalTimelineCardProps {
  festival: FestivalEdicion
  alignment?: 'left' | 'right'
}

export const FestivalTimelineCard = ({
  festival,
  alignment = 'left',
}: FestivalTimelineCardProps) => {
  const { evento, resumen } = festival

  // Obtener todas las disciplinas ordenadas
  const allDisciplines = Object.entries(resumen.por_disciplina)
  // Link a detalles
  // const detailsLink = `/festivales/${evento.edicion.toLowerCase()}`

  const daysDisplay = getDaysDisplay(evento.dias)
  const locationDisplay = getLocation(evento.dias)

  return (
    <article
      className={cn(
        'group outline-fm-black/40 bg-fm- flex w-full max-w-2xl overflow-hidden rounded-2xl outline transition-all duration-300 outline-dashed',
        // Solo cambiamos el orden de las columnas principales (Poster vs Contenido)
        alignment === 'right' ? 'flex-row-reverse' : 'flex-row',
      )}>
      {/* Poster - sin padding, proporcion 53/80 */}
      <div className='relative aspect-53/80 w-80 shrink-0 overflow-hidden'>
        {evento.poster_url ? (
          <Image
            src={evento.poster_url}
            alt={`Afiche ${evento.nombre + evento.edicion}`}
            fill
            className='object-cover'
          />
        ) : (
          <div className='from-fm-yellow to-fm-orange bg-lineal-to-br flex size-full items-center justify-center'>
            <span className='text-fm-white text-4xl font-black'>
              {evento.edicion}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col gap-4 p-4'>
        {/* Title */}
        <header>
          <h3 className='text-fm-orange text-4xl leading-none font-black'>
            {evento.nombre} {evento.edicion}
          </h3>
          <h4 className='text-fm-black/80 text-lg font-semibold'>
            {evento.edicion_nombre}
          </h4>
        </header>

        {/* Date & Location */}
        <div className='text-fm-black/80 text-sm'>
          {daysDisplay && (
            <p className='flex items-center gap-2'>
              <Calendar size={14} className='text-fm-orange shrink-0' />
              <span>{daysDisplay}</span>
            </p>
          )}
          {locationDisplay && (
            <p className='flex items-center gap-2'>
              <MapPin size={14} className='text-fm-orange shrink-0' />
              <span>{locationDisplay}</span>
            </p>
          )}
        </div>

        {/* Stats - formato compacto en linea */}
        <ul className='flex flex-wrap items-center justify-center gap-2'>
          {/* Exponentes total */}
          <FestivalesTimelineCardStats
            stat={resumen.total_participantes.exponentes}
            label='Exponentes'
            size='xl'
            color='black'
          />

          {/* <li className=''> */}
          {/*   <span className='text-fm-black flex items-center gap-2'> */}
          {/*     <Users size={16} className='text-fm-black/70' /> */}
          {/*     Exponentes: */}
          {/*     <strong>{resumen.total_participantes.exponentes}</strong> */}
          {/*   </span> */}
          {/* Disciplinas - lista identada */}
          {/*   {allDisciplines.length > 0 && ( */}
          {/*     <ul className='before:bg-fm-orange relative left-0 ml-8.5 h-fit text-sm before:absolute before:-ml-2 before:inline-block before:h-full before:w-0.5 before:content-[""]'> */}
          {/*       {allDisciplines.map(([label, count]) => ( */}
          {/*         <li key={label} className='text-fm-black'> */}
          {/*           {label}: <strong className='font-semibold'>{count}</strong> */}
          {/*         </li> */}
          {/*       ))} */}
          {/*     </ul> */}
          {/*   )} */}
          {/* </li> */}

          {/* Talleres */}
          <FestivalesTimelineCardStats
            stat={resumen.total_participantes.talleres}
            label='Talleres'
          />

          {/* Musica */}
          <FestivalesTimelineCardStats
            stat={resumen.total_participantes.musica}
            label='Música'
          />
        </ul>

        {/* CTA Button - al fondo */}
        {/* <Link */}
        {/*   href={detailsLink} */}
        {/*   className={cn( */}
        {/*     'outline-fm-orange text-fm-orange hover:bg-fm-orange hover:text-fm-white mt-auto inline-block rounded px-4 py-1.5 text-sm font-medium outline transition-all duration-300', */}
        {/*     alignment === 'right' ? 'self-end' : 'self-start', */}
        {/*   )}> */}
        {/*   Ver Detalles */}
        {/* </Link> */}
      </div>
    </article>
  )
}
