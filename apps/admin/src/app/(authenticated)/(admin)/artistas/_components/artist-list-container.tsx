'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { useArtistListPaginationStore } from '../_store/artist-list-pagination-store'
import { useArtistList } from '../_hooks/use-artist-list'
import { ArtistListFilters } from './artist-list-filters'
import { ArtistListPagination } from './artist-list-pagination'
import { ArtistListTable } from './artist-list-table'
import { EditArtistDialog } from './edit-artist-dialog'
import { AddArtistDialog } from './add-artist-dialog'
import { ArtistHistoryDialog } from './artist-history-dialog'
import { DomainArtist } from '../_types/artist'

interface ArtistListContainerProps {
  artists: DomainArtist[]
}

export function ArtistListContainer({ artists }: ArtistListContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilters = useArtistListFilterStore((s) => s.setFilters)
  const setPage = useArtistListPaginationStore((s) => s.setPage)

  const { countries, cities, paginatedArtists, totalFilteredItems } =
    useArtistList(artists)

  const lastInitRef = useRef(false)

  useEffect(() => {
    if (lastInitRef.current) return
    lastInitRef.current = true

    const searchParam = searchParams.get('search')
    const countryParam = searchParams.get('country')
    const cityParam = searchParams.get('city')
    const statusIdParam = searchParams.get('statusId')
    const pageParam = searchParams.get('page')

    setFilters({
      search: searchParam ?? '',
      country: countryParam ?? null,
      city: cityParam ?? null,
      statusId: statusIdParam ? Number(statusIdParam) : null
    })

    if (pageParam) {
      setPage(Number(pageParam))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only hydration
  }, [])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const params = new URLSearchParams(window.location.search)
    if (newPage === 1) {
      params.delete('page')
    } else {
      params.set('page', String(newPage))
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleFiltersChange = useDebouncedCallback(
    (newFilters: {
      search?: string
      country?: string | null
      city?: string | null
      statusId?: number | null
    }) => {
      const params = new URLSearchParams(window.location.search)

      if (newFilters.search !== undefined) {
        if (!newFilters.search) {
          params.delete('search')
        } else {
          params.set('search', newFilters.search)
        }
      }

      if (newFilters.country !== undefined) {
        if (newFilters.country === null) {
          params.delete('country')
        } else {
          params.set('country', newFilters.country)
        }
      }

      if (newFilters.city !== undefined) {
        if (newFilters.city === null) {
          params.delete('city')
        } else {
          params.set('city', newFilters.city)
        }
      }

      if (newFilters.statusId !== undefined) {
        if (newFilters.statusId === null) {
          params.delete('statusId')
        } else {
          params.set('statusId', String(newFilters.statusId))
        }
      }

      params.delete('page')
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    300
  )

  const handleClearFilters = () => {
    handleFiltersChange({
      search: '',
      country: null,
      city: null,
      statusId: null
    })
  }

  return (
    <div className='grid space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <ArtistListFilters
          countries={countries}
          cities={cities}
          onFiltersChange={handleFiltersChange}
        />
        <AddArtistDialog />
      </div>

      <ArtistListPagination
        onPageChange={handlePageChange}
        totalItems={totalFilteredItems}
      />

      <ArtistListTable
        artists={paginatedArtists}
        onClearFilters={handleClearFilters}
      />

      <ArtistListPagination
        onPageChange={handlePageChange}
        totalItems={totalFilteredItems}
      />

      <EditArtistDialog />
      <ArtistHistoryDialog />
    </div>
  )
}
