'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import Link from 'next/link'

import { useCatalogPanelStore } from '../store/useCatalogPanelStore'
import { CatalogArtistPanelContent } from './CatalogArtistPanelContent'
import { useAnalytics } from '@/components/analytics/useAnalytics'
import { cn } from '@/utils/cn'

import type { CatalogArtist } from '../types/catalog'

export const CatalogPanel = ({
  catalogData
}: {
  catalogData: CatalogArtist[]
}) => {
  const isArtistPanelOpen = useCatalogPanelStore(
    (state) => state.isArtistPanelOpen
  )
  const setArtistPanelOpen = useCatalogPanelStore(
    (state) => state.setArtistPanelOpen
  )

  const searchParams = useSearchParams()
  const artistSlug = searchParams.get('artist')

  const selectedArtist = useMemo(
    () => catalogData.find((a) => a.slug === artistSlug) ?? null,
    [catalogData, artistSlug]
  )

  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const { trackArtistView } = useAnalytics()

  // Initialize panel from URL param: auto-open when ?artist=<slug> is present
  useEffect(() => {
    if (artistSlug && selectedArtist && !isArtistPanelOpen) {
      setArtistPanelOpen(true)
    }
  }, [artistSlug, selectedArtist, isArtistPanelOpen, setArtistPanelOpen])

  useEffect(() => {
    if (isArtistPanelOpen && selectedArtist) {
      trackArtistView({
        artist_name: selectedArtist.name,
        artist_category: selectedArtist.category ?? undefined,
        artist_city: selectedArtist.city
      })
    }
  }, [isArtistPanelOpen, selectedArtist, trackArtistView])

  useEffect(() => {
    if (isArtistPanelOpen) {
      requestAnimationFrame(() => {
        setIsMounted(true)
        requestAnimationFrame(() => setIsVisible(true))
      })
    } else {
      requestAnimationFrame(() => {
        setIsVisible(false)
        setTimeout(() => setIsMounted(false), 300)
      })
    }
  }, [isArtistPanelOpen])

  const closePanel = () => {
    const params = new URLSearchParams(window.location.search)
    params.delete('artist')
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    window.history.replaceState(null, '', newUrl)
    setArtistPanelOpen(false)
  }

  if (!isMounted || !selectedArtist) return null

  return (
    <div
      className={cn(
        'text-foreground fixed inset-0 z-50 overflow-hidden backdrop-blur-sm transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      aria-label='Panel de detalles del artista'
    >
      <div className='fixed inset-0' onClick={closePanel} role='presentation' />

      <aside
        className={cn(
          'bg-background fixed inset-0 w-full max-w-md shadow-xl transition-transform duration-300 ease-in-out sm:top-4 sm:right-4 sm:bottom-4 sm:left-auto sm:rounded-2xl',
          isVisible ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-labelledby='artist-details-heading'
      >
        <div className='flex h-full flex-col overflow-y-auto p-6'>
          <header className='mb-6 flex items-start justify-between'>
            <h2 id='artist-details-heading' className='text-2xl font-bold'>
              Detalles del Artista
            </h2>
            <button
              onClick={closePanel}
              className='hover:text-secondary cursor-pointer rounded-full p-1 transition duration-150 hover:scale-110'
              aria-label='Cerrar panel'
            >
              <X className='h-6 w-6' />
            </button>
          </header>

          <div className='flex-1'>
            <CatalogArtistPanelContent
              artist={selectedArtist}
              catalogData={catalogData}
            />
          </div>

          {/* Sticky CTA: Perfil completo */}
          {selectedArtist.slug && (
            <div className='border-border/20 bg-background sticky bottom-0 mt-6 border-t pt-4'>
              <Link
                href={`/catalogo/${selectedArtist.slug}`}
                aria-label={`Ver perfil completo de ${selectedArtist.name}`}
                className='bg-primary text-background hover:bg-primary/90 block w-full cursor-pointer rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors'
              >
                Perfil completo →
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
