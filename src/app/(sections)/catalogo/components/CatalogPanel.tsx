'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Instagram, Mail, X } from 'lucide-react'
import Markdown from 'react-markdown'

import { useCatalogPanelStore } from '../store/useCatalogPanelStore'
import { getInstagramUserTag, cn } from '@/utils/utils'
import { useAnalytics } from '@/components/analytics/useAnalytics'

import type { CatalogArtist } from '../types/catalog'

export const CatalogPanel = ({
  catalogData,
}: {
  catalogData: CatalogArtist[]
}) => {
  const isArtistPanelOpen = useCatalogPanelStore(
    (state) => state.isArtistPanelOpen,
  )
  const setArtistPanelOpen = useCatalogPanelStore(
    (state) => state.setArtistPanelOpen,
  )
  const setSelectedArtist = useCatalogPanelStore(
    (state) => state.setSelectedArtist,
  )

  const selectedArtist = useCatalogPanelStore((state) => state.selectedArtist)
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const { trackArtistView, trackSocialClick } = useAnalytics()

  // Track artist view when panel opens with a selected artist
  useEffect(() => {
    if (isArtistPanelOpen && selectedArtist) {
      trackArtistView({
        artist_name: selectedArtist.name,
        artist_category: selectedArtist.category ?? undefined,
        artist_city: selectedArtist.city,
      })
    }
  }, [isArtistPanelOpen, selectedArtist, trackArtistView])

  // Handle mount/unmount animation sequence for the panel.
  // We need to mount the component first (setIsMounted), then trigger the visibility animation.
  // This two-phase approach allows CSS transitions to work properly on mount.
  // The setState is intentional here to coordinate the animation lifecycle.
  useEffect(() => {
    if (isArtistPanelOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMounted(true)
      setTimeout(() => setIsVisible(true), 10) // allow mount before animating in
      window.history.pushState({ artistPanel: true }, '')
    } else {
      setIsVisible(false)
      // Unmount after animation duration
      const timeout = setTimeout(() => setIsMounted(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [isArtistPanelOpen])

  // Handle back gesture (popstate) to close the panel instead of navigating back
  useEffect(() => {
    const handlePopState = () => {
      if (isArtistPanelOpen) {
        setArtistPanelOpen(false)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isArtistPanelOpen, setArtistPanelOpen])

  // Obtener miembros del colectivo actual buscando otros artistas con el mismo collective
  const collectiveMembers = selectedArtist?.collective
    ? catalogData.filter(
        (artist) =>
          artist.collective === selectedArtist.collective &&
          artist.id !== selectedArtist.id,
      )
    : []

  const handleChangePanelToCollectiveMember = (collectiveMemberId: string) => {
    const collectiveMember = catalogData.find(
      (artist) => artist.id === collectiveMemberId,
    )

    if (collectiveMember) {
      setSelectedArtist(collectiveMember)
      setArtistPanelOpen(true)
    }
  }

  if (!isMounted) return null

  return (
    <div
      className={cn(
        'text-fm-black fixed inset-0 z-50 overflow-hidden backdrop-blur-sm transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-label='Panel de detalles del artista'>
      <div
        className='fixed inset-0'
        onClick={() => setArtistPanelOpen(false)}
        role='presentation'
      />

      <aside
        className={cn(
          'bg-fm-white fixed inset-0 w-full max-w-md shadow-xl transition-transform duration-300 ease-in-out sm:top-4 sm:right-4 sm:bottom-4 sm:left-auto sm:rounded-2xl',
          isVisible ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-labelledby='artist-details-heading'>
        <div className='h-full overflow-y-auto p-6'>
          <header className='mb-6 flex items-start justify-between'>
            <h2 id='artist-details-heading' className='text-2xl font-bold'>
              Detalles del Artista
            </h2>
            <button
              onClick={() => setArtistPanelOpen(false)}
              className='hover:text-fm-orange cursor-pointer rounded-full p-1 transition duration-150 hover:scale-110'
              aria-label='Cerrar panel'>
              <X className='h-6 w-6' />
            </button>
          </header>

          {selectedArtist && (
            <article className='space-y-6'>
              <section className='flex items-center space-x-4'>
                <figure className='relative h-20 w-20 shrink-0'>
                  <Image
                    src={selectedArtist.avatar}
                    alt={`Imagen de ${selectedArtist.name}`}
                    fill
                    className='border-fm-green rounded-full border-2 object-cover'
                  />
                </figure>
                <div>
                  <h3 className='text-fm-orange text-2xl leading-none font-bold'>
                    {selectedArtist.name}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {selectedArtist.city} - {selectedArtist.country}
                  </p>
                  {selectedArtist.category && (
                    <span className='bg-fm-green/10 text-fm-green mt-1 inline-block rounded-sm px-2 py-1 text-xs'>
                      {selectedArtist.category}
                    </span>
                  )}
                </div>
              </section>

              {/* Colectivo actual y miembros */}
              {selectedArtist.collective && (
                <section>
                  <p className='text-fm-black'>
                    <strong>Colectivo</strong>: {selectedArtist.collective}
                  </p>
                  {collectiveMembers.length > 0 && (
                    <div className='flex gap-1 text-sm'>
                      <p>Miembros:</p>
                      <ul className='flex flex-wrap gap-2'>
                        {collectiveMembers.map((member) => (
                          <li key={member.id}>
                            <button
                              onClick={() =>
                                handleChangePanelToCollectiveMember(member.id)
                              }
                              className='text-fm-orange cursor-pointer hover:underline'>
                              {member.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {/* Historial de participaciones en colectivos */}
              {selectedArtist.collectives.length > 0 && (
                <section>
                  <h4 className='mb-2 font-semibold'>
                    Participaciones en Colectivos
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    {selectedArtist.collectives.map((participation, index) => (
                      <li key={index} className='flex items-center gap-2'>
                        <span className='bg-fm-orange/10 text-fm-orange rounded px-2 py-0.5 text-xs'>
                          {participation.edicion}
                        </span>
                        <span>{participation.name}</span>
                        <span className='text-gray-500'>
                          ({participation.evento})
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Ediciones en las que ha participado */}
              {selectedArtist.editions.length > 0 && (
                <section>
                  <h4 className='mb-2 font-semibold'>
                    Participaciones en Festivales
                  </h4>
                  <ul className='flex flex-wrap gap-2'>
                    {selectedArtist.editions.map((edition, index) => (
                      <li
                        key={index}
                        className='bg-fm-green/10 text-fm-green rounded px-2 py-1 text-xs'>
                        {edition.evento} {edition.edicion}
                        {edition.año && ` (${edition.año})`}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h4 className='mb-2 font-semibold'>Biografia</h4>
                <div className='flex flex-col gap-2 text-sm'>
                  <Markdown>{selectedArtist.bio}</Markdown>
                </div>
              </section>

              <section>
                <h4 className='mb-2 font-semibold'>Contacto</h4>
                <address className='space-y-2 not-italic'>
                  <a
                    href={`mailto:${selectedArtist.email}`}
                    className='hover:text-fm-orange flex items-center transition-colors duration-150'
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() =>
                      trackSocialClick({
                        platform: 'email',
                        location: 'artist_panel',
                      })
                    }>
                    <span className='w-6'>
                      <Mail size={18} />
                    </span>
                    <span>{selectedArtist.email}</span>
                  </a>
                  <a
                    href={selectedArtist.rrss}
                    className='hover:text-fm-orange flex items-center transition-colors duration-150'
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() =>
                      trackSocialClick({
                        platform: 'instagram',
                        location: 'artist_panel',
                      })
                    }>
                    <span className='w-6'>
                      <Instagram size={18} />
                    </span>
                    <span>{getInstagramUserTag(selectedArtist.rrss)}</span>
                  </a>
                </address>
              </section>
            </article>
          )}
        </div>
      </aside>
    </div>
  )
}
