'use client'

import { deleteArtistaAction } from '../_actions/delete-artista.action'
import { restoreArtistaAction } from '../_actions/restore-artista.action'
import type { PaginatedResponse } from '@/shared/types/pagination'
import { DeletedToggle } from '@/shared/components/deleted-toggle-list'
import { EmptyState } from '@/shared/components/empty-state'
import { PaginationControls } from '@/shared/components/pagination-controls'
import type { ArtistListItem, ArtistWithHistory } from '../_types/artist'
import { ArtistListFilters } from './artist-list-filters'
import { ArtistListTable } from './artist-list-table'
import { UpdateArtistDialog } from './update-artist-dialog'
import { CreateArtistDialog } from './create-artist-dialog'
import { ArtistHistoryDialog } from './artist-history-dialog'
import { throttle, useQueryStates } from 'nuqs'
import { artistQueryParams } from '../_lib/search-params'
import { useDeletedToggleList } from '@/shared/components/deleted-toggle-list/use-deleted-toggle-list'

interface ArtistListContainerProps {
  artists: ArtistWithHistory[]
  deletedArtists: ArtistWithHistory[]
  countries: string[]
  cities: string[]
  pagination: Omit<PaginatedResponse<ArtistListItem>, 'data'>
}

export function ArtistListContainer({
  artists,
  deletedArtists,
  countries,
  cities,
  pagination
}: ArtistListContainerProps) {
  const [filters, setFilters] = useQueryStates(artistQueryParams, {
    shallow: false,
    limitUrlUpdates: throttle(500)
  })
  const showDeleted = filters.mostrar_eliminados ?? false

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      search: '',
      mostrar_eliminados: null,
      pais: null,
      ciudad: null,
      estado: null
    })
  }

  const {
    visibleItems,
    toggleShowDeleted,
    handleDelete,
    handleRestore,
    deletedCount,
    isPending
  } = useDeletedToggleList({
    activeItems: artists,
    deletedItems: deletedArtists,
    showDeleted,
    onShowDeletedChange: (nextShowDeleted: boolean) => {
      setFilters({
        page: 1,
        mostrar_eliminados: nextShowDeleted ? true : null
      })
    },
    getId: (artist) => artist.id,
    isDeleted: (artist) => artist.deletedAt !== null,
    deleteItem: deleteArtistaAction,
    restoreItem: restoreArtistaAction,
    messages: {
      deleteSuccess: 'Artista eliminado correctamente',
      deleteError: 'Ocurrió un problema al intentar eliminar al artista',
      restoreSuccess: 'Artista restaurado correctamente',
      restoreError: 'Ocurrió un problema al intentar restaurar al artista'
    }
  })

  const emptyState = showDeleted ? (
    <EmptyState
      title='No hay artistas eliminados'
      description='Todavía no existen artistas eliminados para restaurar.'
    />
  ) : (
    <EmptyState
      title='No se encontraron artistas'
      description='No hay artistas que coincidan con los filtros seleccionados.'
      action={{
        label: 'Limpiar filtros',
        onClick: handleClearFilters
      }}
    />
  )

  return (
    <article className='grid space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        {!showDeleted ? <CreateArtistDialog /> : null}
        <DeletedToggle
          showDeleted={showDeleted}
          onToggle={toggleShowDeleted}
          deletedCount={deletedCount}
        />
      </div>

      <ArtistListFilters
        countries={countries}
        cities={cities}
        filters={filters}
        setFilters={setFilters}
      />

      {!showDeleted ? (
        <PaginationControls
          {...pagination}
          onPageChange={(newPage) => setFilters({ page: newPage })}
          itemNoun='artistas'
        />
      ) : null}

      <ArtistListTable
        artists={visibleItems}
        showDeleted={showDeleted}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        emptyState={emptyState}
        isPending={isPending}
      />

      {!showDeleted ? (
        <PaginationControls
          {...pagination}
          onPageChange={(newPage) => setFilters({ page: newPage })}
          itemNoun='artistas'
        />
      ) : null}

      <UpdateArtistDialog />
      <ArtistHistoryDialog />
    </article>
  )
}
