'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Card } from '@/shared/components/ui/card'
import { useRouteChanges } from '@/shared/hooks/use-route-changes'
import { RouteSaveToolbar } from '@/shared/components/route-save-toolbar'
import { useArtistaPush } from '../_hooks/use-artista-push'
import { toast } from 'sonner'
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { useArtistListPaginationStore } from '../_store/artist-list-pagination-store'
import { useArtistList } from '../_hooks/use-artist-list'
import { ArtistListFilters } from './artist-list-filters'
import { ArtistListPagination } from './artist-list-pagination'
import { ArtistListTable } from './artist-list-table'
import { EditArtistDialog } from './edit-artist-dialog'
import { ArtistHistoryDialog } from './artist-history-dialog'
import { useHistoryByArtist } from '../_hooks/use-history-by-artist'
import type { HistoryEntry } from '../_types'

export function ArtistListContainer({
  historyData
}: {
  historyData: HistoryEntry[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilters = useArtistListFilterStore((s) => s.setFilters)
  const setPage = useArtistListPaginationStore((s) => s.setPage)

  const { save, isPending, result } = useArtistaPush()

  const { isDirty, discardAll } = useRouteChanges('/artistas/listado')

  const lastToastRef = useRef<number>(0)

  // Toast after save
  useEffect(() => {
    if (result?.success && !isPending) {
      const now = Date.now()
      if (now - lastToastRef.current > 500) {
        lastToastRef.current = now
        toast.success('Guardado correctamente')
      }
    }
  }, [result, isPending])

  const { countries, cities } = useArtistList()

  const { historyByArtistId, artistIdsWithHistory } =
    useHistoryByArtist(historyData)

  // Hydrate store from URL only on mount.
  // After mount, the store is the source of truth — URL follows the store via
  // handleFiltersChange. Re-running on every searchParams change causes a
  // race condition that overwrites keystrokes typed during the debounce window.
  useEffect(() => {
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

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      // Read current search params at call time to avoid a reactive subscription
      // that would cause this component to re-render on every URL change.
      const params = new URLSearchParams(window.location.search)
      if (newPage === 1) {
        params.delete('page')
      } else {
        params.set('page', String(newPage))
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [setPage, router]
  )

  const handleFiltersChange = useDebouncedCallback(
    useCallback(
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
      [router]
    ),
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
      </div>

      <ArtistListPagination onPageChange={handlePageChange} />

      <Card className='py-0'>
        <ArtistListTable
          onClearFilters={handleClearFilters}
          artistIdsWithHistory={artistIdsWithHistory}
        />
      </Card>

      <ArtistListPagination onPageChange={handlePageChange} />

      <EditArtistDialog />
      <ArtistHistoryDialog historyByArtistId={historyByArtistId} />

      {/* TODO: Verify sequential commit ordering and ID mapping for multi-entity routes */}
      <RouteSaveToolbar
        isDirty={isDirty}
        onSave={save}
        onDiscard={discardAll}
        isPending={isPending}
      />
    </div>
  )
}
