'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Card } from '@/shared/components/ui/card'
import { useRouteChanges } from '@/shared/hooks/use-route-changes'
import { RouteSaveToolbar } from '@/shared/components/route-save-toolbar'
import { RestoredChangesNotice } from '@/shared/components/restored-changes-notice'
import { useArtistaCommit } from '../../_hooks/use-artista-commit'
import { useAutoCommit } from '@/shared/ui-state/operation-log/hooks/use-auto-commit'
import { useArtistsOperationStore } from '../../_store/artista-ui-store'
import { useHistoryOperationStore } from '../_store/history-ui-store'
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { useArtistListPaginationStore } from '../_store/artist-list-pagination-store'
import { useArtistList } from '../_hooks/use-artist-list'
import { ArtistListFilters } from './artist-list-filters'
import { ArtistListPagination } from './artist-list-pagination'
import { ArtistListTable } from './artist-list-table'
import { EditArtistDialog } from './edit-artist-dialog'
import { ArtistHistoryDialog } from './artist-history-dialog'

export function ArtistListContainer() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilters = useArtistListFilterStore((s) => s.setFilters)
  const setPage = useArtistListPaginationStore((s) => s.setPage)

  const { save, isPending } = useArtistaCommit()

  const { isDirty, noticeVisible, dismissNotice, discardAll } =
    useRouteChanges('/artistas/listado')

  // Initialize auto-commit for both operation stores
  useAutoCommit(useArtistsOperationStore)
  useAutoCommit(useHistoryOperationStore)

  const { countries, cities } = useArtistList()

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
  }, [searchParams, setFilters, setPage])

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      const params = new URLSearchParams(searchParams.toString())
      if (newPage === 1) {
        params.delete('page')
      } else {
        params.set('page', String(newPage))
      }
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [setPage, router, searchParams]
  )

  const handleFiltersChange = useDebouncedCallback(
    (newFilters: {
      search?: string
      country?: string | null
      city?: string | null
      statusId?: number | null
    }) => {
      const params = new URLSearchParams(searchParams.toString())

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

      router.push(`?${params.toString()}`, { scroll: false })
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
        {/* SaveButton removed — replaced by RouteSaveToolbar (Task 9) */}
      </div>

      <ArtistListPagination onPageChange={handlePageChange} />

      <Card className='py-0'>
        <ArtistListTable onClearFilters={handleClearFilters} />
      </Card>

      <ArtistListPagination onPageChange={handlePageChange} />

      <EditArtistDialog />
      <ArtistHistoryDialog />

      {/* RouteSaveToolbar replaces old inline SaveButton */}
      {/* TODO: Verify sequential commit ordering and ID mapping for multi-entity routes */}
      <RouteSaveToolbar
        isDirty={isDirty}
        onSave={save}
        onDiscard={discardAll}
        isPending={isPending}
      />
      <RestoredChangesNotice
        visible={noticeVisible}
        onDismiss={dismissNotice}
      />
    </div>
  )
}
