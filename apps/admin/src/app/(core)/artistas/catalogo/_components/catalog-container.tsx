'use client'

import { debounce, useQueryStates } from 'nuqs'
import type { PaginationParams } from '@/shared/types/pagination'
import type {
  CatalogAvailableArtist,
  CatalogListItem
} from '../_types/catalog-list-item'
import { DeletedToggle } from '@/shared/components/deleted-toggle-list'
import { useDeletedToggleList } from '@/shared/components/deleted-toggle-list/use-deleted-toggle-list'
import { deleteCatalogAction } from '../_actions/delete-catalog.action'
import { restoreCatalogAction } from '../_actions/restore-catalog.action'
import { CatalogFilters } from './catalog-filters'
import { CreateCatalogDialog } from './create-catalog-dialog'
import { UpdateCatalogDialog } from './update-catalog-dialog'
import { catalogQueryParams } from '../_lib/search-params'
import { CatalogTable } from './catalog-table'
import { PaginationControls } from '@/shared/components/pagination-controls'
import { EmptyState } from '@/shared/components/empty-state'

interface CatalogContainerProps {
  catalog: CatalogListItem[]
  deletedCatalog: CatalogListItem[]
  availableArtists: CatalogAvailableArtist[]
  pagination: PaginationParams
}

export function CatalogContainer({
  catalog,
  deletedCatalog,
  availableArtists,
  pagination
}: CatalogContainerProps) {
  const [filters, setFilters] = useQueryStates(catalogQueryParams, {
    shallow: false,
    limitUrlUpdates: debounce(300)
  })
  const showDeleted = filters.mostrar_eliminados ?? false

  const handleClearFilters = () => {
    void setFilters({
      page: 1,
      search: '',
      activo: null,
      destacado: null,
      mostrar_eliminados: false
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
    activeItems: catalog,
    deletedItems: deletedCatalog,
    showDeleted,
    onShowDeletedChange: (nextShowDeleted: boolean) => {
      setFilters({
        page: 1,
        mostrar_eliminados: nextShowDeleted ? true : null
      })
    },
    getId: (item) => item.id,
    isDeleted: (item) => item.deletedAt !== null,
    deleteItem: deleteCatalogAction,
    restoreItem: restoreCatalogAction,
    messages: {
      deleteSuccess:
        'El artista del catálogo fue eliminado exitosamente',
      deleteError:
        'Ocurrió un error al intentar eliminar al artista del catálogo',
      restoreSuccess: 'Artista del catálogo restaurado correctamente',
      restoreError:
        'Ocurrió un error al intentar restaurar al artista del catálogo'
    }
  })

  const emptyState = showDeleted ? (
    <EmptyState
      title='No hay artistas eliminados en el catálogo'
      description='Todavía no existen elementos eliminados para restaurar.'
    />
  ) : (
    <EmptyState
      title='No se encontraron artistas en el catálogo'
      description='No hay artistas que coincidan con los filtros aplicados. Intenta ajustar los filtros para encontrar artistas.'
      action={{
        label: 'Limpiar filtros',
        onClick: handleClearFilters
      }}
    />
  )

  return (
    <div className='grid space-y-4'>
      <div className='flex items-center justify-between'>
        <DeletedToggle
          showDeleted={showDeleted}
          onToggle={toggleShowDeleted}
          deletedCount={deletedCount}
        />

        {!showDeleted ? (
          <CreateCatalogDialog availableArtists={availableArtists} />
        ) : null}
      </div>

      {!showDeleted ? (
        <>
          <CatalogFilters filters={filters} setFilters={setFilters} />

          <PaginationControls
            {...pagination}
            onPageChange={(newPage) => setFilters({ page: newPage })}
            itemNoun='artistas'
          />
        </>
      ) : null}

      {visibleItems.length === 0 ? (
        emptyState
      ) : (
        <CatalogTable
          items={visibleItems}
          showDeleted={showDeleted}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onClearFilters={handleClearFilters}
          isPending={isPending}
        />
      )}

      {!showDeleted ? (
        <PaginationControls
          {...pagination}
          onPageChange={(newPage) => setFilters({ page: newPage })}
          itemNoun='artistas'
        />
      ) : null}

      <UpdateCatalogDialog />
    </div>
  )
}
