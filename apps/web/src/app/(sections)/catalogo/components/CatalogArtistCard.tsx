'use client'

import Image from 'next/image'
import type { CatalogArtist } from '../types/catalog'
import { Mail } from 'lucide-react'
import { useCatalogPanelStore } from '../store/useCatalogPanelStore'
import { cn } from '@/utils/cn'
import { Instagram } from '@/components/icons/Instagram'

export const CatalogArtistCard = ({
  id,
  avatar,
  name,
  slug,
  city,
  country,
  category,
  bio,
  email,
  rrss,
  collective,
  editions,
  orden,
  destacado
}: CatalogArtist) => {
  const selectedArtist = useCatalogPanelStore((state) => state.selectedArtist)
  const setSelectedArtist = useCatalogPanelStore(
    (state) => state.setSelectedArtist
  )
  const setArtistPanelOpen = useCatalogPanelStore(
    (state) => state.setArtistPanelOpen
  )

  const isSelected = selectedArtist?.id === id

  const handleOpenPanel = () => {
    setSelectedArtist({
      id,
      avatar,
      name,
      slug,
      city,
      country,
      category,
      bio,
      email,
      rrss,
      collective,
      editions,
      orden,
      destacado
    })
    setArtistPanelOpen(true)
  }

  return (
    <li
      className={cn(
        'text-primary group hover:bg-background outline-primary/50 bg-background w-full outline-1 outline-dashed hover:outline-solid sm:max-w-xs lg:max-w-sm',
        'relative flex flex-col justify-around space-y-2 rounded-xl p-4 transition-all duration-300',
        {
          'scale-105 outline-solid': isSelected
        }
      )}
    >
      <section className='flex items-center gap-4'>
        <Image
          loading='lazy'
          src={avatar}
          alt={`Imagen de ${name}`}
          width={48}
          height={48}
          className='h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-300 object-cover'
        />
        <section>
          <h2 className='text-primary font-canarina text-3xl leading-none font-bold tracking-wide transition-colors duration-300'>
            {name}
          </h2>
          {collective && (
            <p className='text-primary/80 mt-1 text-sm leading-none'>
              <span className='font-semibold'>Colectivo:</span> {collective}
            </p>
          )}
          <div className='flex gap-2 py-1'>
            {category && (
              <span className='bg-secondary/20 text-secondary rounded px-2 py-1 text-xs leading-none font-medium'>
                {category}
              </span>
            )}
            {city && (
              <span className='bg-secondary/20 text-secondary rounded px-2 py-1 text-xs leading-none font-medium'>
                {city}
              </span>
            )}
          </div>
        </section>
      </section>

      <section className='text-sm'>
        <section className='text-primary/80 flex w-full items-center gap-2'>
          <b className='font-semibold'>Contacto:</b>
          <a
            href={rrss}
            aria-label='Instagram'
            className='hover:text-secondary relative z-20 transition duration-300 hover:scale-105'
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
          >
            <Instagram size={18} />
          </a>
          <a
            href={`mailto:${email}`}
            aria-label='Email'
            className='hover:text-secondary relative z-20 transition duration-300 hover:scale-105'
            onClick={(e) => e.stopPropagation()}
          >
            <Mail size={20} strokeWidth={1.2} />
          </a>
        </section>

        {/* Ver más — solo on hover */}
        <button
          onClick={handleOpenPanel}
          className={cn(
            'absolute right-4 bottom-4 cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-all duration-300',
            'bg-primary text-background rotate-6',
            'opacity-100 group-hover:rotate-0 group-hover:opacity-100 xl:opacity-0'
          )}
        >
          Ver más
        </button>
      </section>
    </li>
  )
}
