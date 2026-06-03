import { getFeaturedArtists } from '@/data/data-access-layer/featured-artists/getFeaturedArtists'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export async function FeaturedArtists() {
  const featuredArtists = await getFeaturedArtists()

  if (!featuredArtists || featuredArtists.length === 0)
    return (
      <p className='text-foreground/60 mx-auto block w-full max-w-lg pt-10 text-center'>
        No hay artistas destacados en este momento. ¡Vuelve pronto para
        descubrir algunxs de lxs mejores artistas de la Región!
      </p>
    )

  const mappedFeaturedArtists = featuredArtists.map((artist) => ({
    ...artist,
    rrss: JSON.parse(artist.rrss) as { [key: string]: string }
  }))

  return mappedFeaturedArtists.map((artist) => (
    <div key={artist.slug} className='relative'>
      <h3 className='font-roboto-mono ml-2 text-lg font-medium uppercase'>
        {artist.pseudonimo}
      </h3>
      <Link
        aria-label={`Ver perfil de ${artist.pseudonimo} en Instagram`}
        href={artist.rrss.instagram || '#'}
        className='before:bg-foreground relative block size-50'
        target='_blank'
      >
        <StarIcon className='fill-accent stroke-foreground absolute top-0 right-0 z-10 size-8 translate-x-4 -translate-y-4 rotate-20 stroke-1 will-change-transform' />
        <div className='bg-foreground absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-150 group-hover:translate-0'></div>
        <div className='border-foreground group relative overflow-hidden rounded-lg border-2'>
          <Image
            src={getAvatarUrl(artist.imagen_url)}
            alt={`${artist.pseudonimo} avatar`}
            width={200}
            height={200}
            className='size-full object-cover duration-150'
          />

          {/* <span className='bg-primary text-background border-foreground font-roboto-mono absolute top-0 right-0 bottom-0 left-0 m-auto flex size-fit items-center justify-center gap-2 rounded border px-2 py-2 leading-none opacity-0 duration-150 group-hover:opacity-100'> */}
          {/*   Ver más <ArrowRight className='size-4' /> */}
          {/* </span> */}
        </div>
      </Link>
    </div>
  ))
}
