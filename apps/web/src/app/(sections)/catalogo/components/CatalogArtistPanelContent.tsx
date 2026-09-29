import Image from 'next/image'
import { Mail } from 'lucide-react'
import { Instagram } from '@/components/icons/Instagram'
import Markdown from 'react-markdown'

import { ArtistAvatarTransition } from '@/components/transitions/ArtistAvatarTransition'
import { ArtistNameTransition } from '@/components/transitions/ArtistNameTransition'
import { CollectiveMemberLink } from './CollectiveMemberLink'
import { getInstagramUserTag } from '@frijolmagico/utils/string'
import { groupFestivalParticipations } from '../lib/groupFestivalParticipations'

import type { CatalogArtist } from '../types/catalog'

// ── Props ──

export interface CatalogArtistPanelContentProps {
  artist: CatalogArtist
  catalogData: CatalogArtist[]
}

// ── Componente ──

export const CatalogArtistPanelContent = ({
  artist,
  catalogData
}: CatalogArtistPanelContentProps) => {
  const collectiveMembers = artist.collective
    ? catalogData.filter(
        (a) => a.collective === artist.collective && a.id !== artist.id
      )
    : []

  const festivalParticipations = groupFestivalParticipations(artist.editions)

  return (
    <article className='space-y-6'>
      {/* Avatar + Name + Location + Category */}
      <section className='flex items-center space-x-4'>
        <ArtistAvatarTransition slug={artist.slug ?? ''}>
          <figure className='relative h-20 w-20 shrink-0'>
            <Image
              src={artist.avatar}
              alt={`Imagen de ${artist.name}`}
              fill
              sizes='80px'
              className='border-primary rounded-full border-2 object-cover'
            />
          </figure>
        </ArtistAvatarTransition>
        <div>
          <ArtistNameTransition slug={artist.slug ?? ''}>
            <h3 className='text-secondary text-2xl leading-none font-bold'>
              {artist.name}
            </h3>
          </ArtistNameTransition>
          <p className='text-sm text-gray-600'>
            {artist.city} - {artist.country}
          </p>
          {artist.category && (
            <span className='bg-primary/10 text-primary mt-1 inline-block rounded-sm px-2 py-1 text-xs'>
              {artist.category}
            </span>
          )}
        </div>
      </section>

      {/* Colectivo y miembros */}
      {artist.collective && (
        <section>
          <p className='text-foreground'>
            <strong>Colectivo</strong>: {artist.collective}
          </p>
          {collectiveMembers.length > 0 && (
            <div className='flex gap-1 text-sm'>
              <p>Miembros:</p>
              <ul className='flex flex-wrap gap-2'>
                {collectiveMembers.map((member) => (
                  <li key={member.id}>
                    <CollectiveMemberLink
                      slug={member.slug ?? ''}
                      name={member.name}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Festival participations */}
      {festivalParticipations.length > 0 && (
        <section className='space-y-3'>
          <h4 className='font-semibold'>Participaciones en Festivales</h4>
          <ul className='space-y-4 pl-2'>
            {festivalParticipations.map((festival) => (
              <li key={festival.evento_id} className='space-y-2 pl-2'>
                <p className='text-sm font-semibold'>{festival.evento}</p>
                <ul className='space-y-2 pl-2'>
                  {festival.categories.map((category) => (
                    <li key={`${festival.evento_id}:${category.key}`}>
                      <p className='text-xs font-medium'>{category.label}</p>
                      <ul className='flex flex-wrap gap-2 pl-2'>
                        {category.editions.map((edition) => (
                          <li
                            key={`${festival.evento_id}:${category.key}:${edition.edicion}:${edition.año ?? 'sin-año'}`}
                          >
                            <span className='bg-primary/10 text-primary rounded px-2 py-1 text-xs'>
                              {edition.edicion}
                              {edition.año && ` (${edition.año})`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Biografía */}
      <section>
        <h4 className='mb-2 font-semibold'>Biografia</h4>
        <div className='flex flex-col gap-2 text-sm'>
          <Markdown>{artist.bio}</Markdown>
        </div>
      </section>

      {/* Contacto */}
      <section>
        <h4 className='mb-2 font-semibold'>Contacto</h4>
        <address className='space-y-2 not-italic'>
          <a
            href={`mailto:${artist.email}`}
            className='hover:text-secondary flex items-center transition-colors duration-150'
          >
            <span className='w-6'>
              <Mail size={18} strokeWidth={1.5} />
            </span>
            <span>{artist.email}</span>
          </a>
          <a
            href={artist.rrss}
            className='hover:text-secondary flex items-center transition-colors duration-150'
          >
            <span className='w-6'>
              <Instagram size={18} strokeWidth={1.6} />
            </span>
            <span>{getInstagramUserTag(artist.rrss)}</span>
          </a>
        </address>
      </section>
    </article>
  )
}
