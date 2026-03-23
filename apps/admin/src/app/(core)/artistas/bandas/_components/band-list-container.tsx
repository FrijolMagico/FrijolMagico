'use client'

import { throttle, useQueryStates } from 'nuqs'
import {
  DeletedToggle,
  useDeletedToggleList
} from '@/shared/components/deleted-toggle-list'
import { EmptyState } from '@/shared/components/empty-state'
import { PaginationControls } from '@/shared/components/pagination-controls'
import type { PaginatedResponse } from '@/shared/types/pagination'
import { deleteBandaAction } from '../_actions/delete-banda.action'
import { restoreBandaAction } from '../_actions/restore-banda.action'
import { bandQueryParams } from '../_lib/search-params'
import type { BandRow, DeletedBandRow } from '../_types/band'
import { BandCreateDialog } from './band-create-dialog'
import { BandListTable } from './band-list-table'
import { BandUpdateDialog } from './band-update-dialog'

interface BandListContainerProps {
  activeBands: PaginatedResponse<BandRow>
  deletedBands: PaginatedResponse<DeletedBandRow>
}

export function BandListContainer({
  activeBands,
  deletedBands
}: BandListContainerProps) {
  const [params, setParams] = useQueryStates(bandQueryParams, {
    shallow: false,
    limitUrlUpdates: throttle(300)
  })
  const mostrar_eliminados = params.mostrar_eliminados ?? false

  const {
    visibleItems,
    deletedCount,
    handleDelete,
    handleRestore,
    toggleShowDeleted
  } = useDeletedToggleList<BandRow | DeletedBandRow, number>({
    activeItems: activeBands.data,
    deletedItems: deletedBands.data,
    showDeleted: mostrar_eliminados,
    onShowDeletedChange: (nextShowDeleted: boolean) => {
      setParams({
        page: 1,
        mostrar_eliminados: nextShowDeleted ? true : null
      })
    },
    getId: (band) => band.id,
    isDeleted: (band) => 'deletedAt' in band && Boolean(band.deletedAt),
    deleteItem: deleteBandaAction,
    restoreItem: restoreBandaAction
  })

  const pagination = mostrar_eliminados ? deletedBands : activeBands
  const emptyState = mostrar_eliminados
    ? {
        title: 'No hay bandas eliminadas',
        description: 'Todavía no existen bandas enviadas a la papelera.'
      }
    : {
        title: 'No hay bandas registradas',
        description:
          'Crea la primera banda para comenzar a gestionar este catálogo.'
      }

  return (
    <article className='grid gap-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <DeletedToggle
          showDeleted={mostrar_eliminados}
          deletedCount={deletedBands.total || deletedCount}
          onToggle={toggleShowDeleted}
        />

        {!mostrar_eliminados && <BandCreateDialog />}
      </div>

      {visibleItems.length === 0 ? (
        <EmptyState {...emptyState} />
      ) : (
        <BandListTable
          items={visibleItems}
          showDeleted={mostrar_eliminados}
          onEdit={() => undefined}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      )}

      <PaginationControls
        {...pagination}
        onPageChange={(page) => setParams({ page })}
        itemNoun='bandas'
      />

      <BandUpdateDialog />
    </article>
  )
}
