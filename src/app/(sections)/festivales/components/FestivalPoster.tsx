import { cn } from '@/utils/utils'
import Image from 'next/image'

interface FestivalPosterProps {
  posterUrl: string | null
  nombre: string
  edicion: string
  isActive: boolean
  priority?: boolean
}

export const FestivalPoster = ({
  posterUrl,
  nombre,
  edicion,
  isActive,
  priority = false,
}: FestivalPosterProps) => (
  <div className='bg-fm-black/5 relative aspect-283/400 w-72 shrink-0 overflow-hidden rounded-3xl'>
    {posterUrl ? (
      <>
        <Image
          src={posterUrl}
          alt={`Afiche ${nombre} ${edicion}`}
          fill
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 288px'
          className={cn(
            'object-cover transition-transform duration-1000',
            isActive && 'scale-110',
          )}
        />
        <div className='from-fm-black/60 via-fm-black/10 absolute inset-0 bg-linear-to-t to-transparent opacity-80 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0' />
      </>
    ) : (
      <div className='from-fm-orange to-fm-yellow flex size-full items-center justify-center bg-linear-to-br'>
        <span className='text-fm-white text-7xl leading-none font-black drop-shadow-lg'>
          {edicion}
        </span>
      </div>
    )}
  </div>
)
