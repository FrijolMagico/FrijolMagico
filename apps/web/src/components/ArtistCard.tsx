import { getAvatarUrl } from '@frijolmagico/utils/cdn'
import { ArrowRight, StarIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { ArtistAvatarTransition } from '@/components/transitions/ArtistAvatarTransition'
import { ArtistNameTransition } from '@/components/transitions/ArtistNameTransition'

interface ArtistCardProps {
  artist: {
    pseudonimo: string
    slug?: string
    imagen_url: string
  }
  isFeatured?: boolean
}

export function ArtistCard({ artist, isFeatured }: ArtistCardProps) {
  return (
    <div className='relative'>
      <ArtistNameTransition slug={artist.slug ?? ''}>
        <h3 className='font-roboto-mono text-primary mb-2 ml-2 text-lg leading-none font-bold'>
          {artist.pseudonimo}
        </h3>
      </ArtistNameTransition>
      <Link
        aria-label={`Ver perfil de ${artist.pseudonimo}`}
        href={artist.slug ? `/catalogo/${artist.slug}` : '#'}
        transitionTypes={['artist-detail']}
        className='before:bg-primary group relative block size-50'
      >
        {isFeatured && (
          <StarIcon className='fill-accent stroke-foreground absolute top-0 right-0 z-10 size-8 translate-x-4 -translate-y-4 rotate-20 stroke-1 will-change-transform' />
        )}
        <div className='bg-primary absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-300 group-hover:translate-0'></div>
        <div className='border-primary group relative overflow-hidden rounded-lg border-2'>
          <ArtistAvatarTransition slug={artist.slug ?? ''}>
            <Image
              src={getAvatarUrl(artist.imagen_url)}
              alt={`${artist.pseudonimo} avatar`}
              width={200}
              height={200}
              className='size-full origin-center object-cover duration-300 group-hover:scale-110'
            />
          </ArtistAvatarTransition>
          <span className='bg-primary text-background absolute top-0 right-0 bottom-0 left-0 m-auto flex size-fit items-center justify-center gap-2 rounded-md border px-2 py-2 leading-none opacity-0 duration-150 group-hover:opacity-100'>
            Ver más <ArrowRight className='size-4' />
          </span>
        </div>
      </Link>
    </div>
  )
}
