import Link from 'next/link'
import SITE_DATA from '@/data/site.json'
import { ArrowRightIcon } from 'lucide-react'

export function PodcastBanner() {
  return (
    <section className='bg-palette-shadow relative flex h-full w-full items-center justify-center overflow-hidden px-2'>
      {/* Animated background orbs */}
      <div className='bg-palette-primary pointer-events-none absolute top-0 right-0 left-0 z-0 mx-auto aspect-square w-1/2 rounded-full blur-[100px]' />

      <div className='relative z-10 w-screen max-w-lg space-y-3 md:space-y-4'>
        <div className='flex justify-center gap-2'>
          <span className='wavy-underline font-roboto-mono text-palette-background block text-center text-sm lowercase'>
            Nuevos
          </span>
          <h2 className='text-palette-secondary text-center text-lg font-bold tracking-wider uppercase md:text-xl'>
            Capitulos
          </h2>
        </div>
        <p className='text-palette-background font-canarina -mt-4 text-center text-3xl leading-none font-bold tracking-wider md:text-6xl'>
          Semilla Ilustrada
        </p>

        <p className='text-palette-secondary -mt-3 text-center text-xs leading-tight md:text-base'>
          Escucha nuestro podcast y descubre historias, entrevistas y
          reflexiones sobre el mundo de la ilustración y el arte visual.
        </p>
        <div className='relative flex justify-center'>
          <Link
            href={SITE_DATA.podcast}
            target='_blank'
            className='text-palette-background hover:text-palette-primary hover:bg-palette-secondary border-palette-accent hover:border-palette-background bg-palette-primary group mx-2 flex gap-3 rounded-lg border-2 px-4 py-2 font-bold transition duration-300'
          >
            Escucha aquí
            <ArrowRightIcon className='block duration-200 group-hover:-rotate-45' />
          </Link>
        </div>
      </div>
    </section>
  )
}
