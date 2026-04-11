import { cn } from '@/utils/cn'
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
  priority = false
}: FestivalPosterProps) => (
  <div className='bg-foreground/5 relative aspect-283/400 w-72 shrink-0 overflow-hidden rounded-3xl'>
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
            isActive && 'scale-110'
          )}
        />
        <div className='from-foreground/60 via-foreground/10 absolute inset-0 bg-linear-to-t to-transparent opacity-80 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0' />
      </>
    ) : (
      <div className='from-secondary to-accent flex size-full items-center justify-center bg-linear-to-br'>
        <span className='text-background text-7xl leading-none font-black drop-shadow-lg'>
          {edicion}
        </span>
      </div>
    )}
  </div>
)
