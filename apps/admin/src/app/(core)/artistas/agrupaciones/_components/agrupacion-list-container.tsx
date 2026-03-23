'use client'

import { throttle, useQueryStates } from 'nuqs'
import {
  DeletedToggle,
  useDeletedToggleList
} from '@/shared/components/deleted-toggle-list'
import { EmptyState } from '@/shared/components/empty-state'
import { PaginationControls } from '@/shared/components/pagination-controls'
import type { PaginatedResponse } from '@/shared/types/pagination'
import { deleteAgrupacionAction } from '../_actions/delete-agrupacion.action'
import { restoreAgrupacionAction } from '../_actions/restore-agrupacion.action'
import { agrupacionQueryParams } from '../_lib/search-params'
import type { AgrupacionRow, DeletedAgrupacionRow } from '../_types/agrupacion'
import { AgrupacionCreateDialog } from './agrupacion-create-dialog'
import { AgrupacionDetailDialog } from './agrupacion-detail-dialog'
import { AgrupacionListTable } from './agrupacion-list-table'
import { AgrupacionUpdateDialog } from './agrupacion-update-dialog'

interface AgrupacionListContainerProps {
  activeAgrupaciones: PaginatedResponse<AgrupacionRow>
  deletedAgrupaciones: PaginatedResponse<DeletedAgrupacionRow>
}

export function AgrupacionListContainer({
  activeAgrupaciones,
  deletedAgrupaciones
}: AgrupacionListContainerProps) {
  const [params, setParams] = useQueryStates(agrupacionQueryParams, {
    shallow: false,
    limitUrlUpdates: throttle(300)
  })

  const mostrar_eliminados = params.mostrar_eliminados ?? false

  const {
    visibleItems,
    handleDelete,
    handleRestore,
    deletedCount,
    toggleShowDeleted
  } = useDeletedToggleList({
    activeItems: activeAgrupaciones.data,
    deletedItems: deletedAgrupaciones.data,
    showDeleted: mostrar_eliminados,
    onShowDeletedChange: (nextShowDeleted) => {
      void setParams({
        page: 1,
        mostrar_eliminados: nextShowDeleted ? true : null
      })
    },
    getId: (item) => item.id,
    isDeleted: (item) => 'deletedAt' in item && item.deletedAt !== null,
    deleteItem: deleteAgrupacionAction,
    restoreItem: restoreAgrupacionAction,
    messages: {
      deleteSuccess: 'Agrupación eliminada correctamente',
      deleteError: 'No se pudo eliminar la agrupación',
      restoreSuccess: 'Agrupación restaurada correctamente',
      restoreError: 'No se pudo restaurar la agrupación'
    }
  })

  const pagination = mostrar_eliminados
    ? deletedAgrupaciones
    : activeAgrupaciones

  const emptyState = mostrar_eliminados ? (
    <EmptyState
      title='No hay agrupaciones eliminadas'
      description='Todavía no existen agrupaciones para restaurar.'
    />
  ) : (
    <EmptyState
      title='No hay agrupaciones registradas'
      description='Creá la primera agrupación para empezar a gestionar sus integrantes.'
    />
  )

  return (
    <article className='grid gap-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <DeletedToggle
          showDeleted={mostrar_eliminados}
          deletedCount={deletedAgrupaciones.total || deletedCount}
          onToggle={toggleShowDeleted}
        />

        {!mostrar_eliminados && <AgrupacionCreateDialog />}
      </div>

      <PaginationControls
        {...pagination}
        onPageChange={(page) => setParams({ page })}
        itemNoun='agrupaciones'
      />

      <AgrupacionListTable
        items={visibleItems}
        isDeleted={mostrar_eliminados}
        onDelete={handleDelete}
        onRestore={handleRestore}
        emptyState={emptyState}
      />

      <PaginationControls
        {...pagination}
        onPageChange={(page) => setParams({ page })}
        itemNoun='agrupaciones'
      />

      <AgrupacionUpdateDialog />
      <AgrupacionDetailDialog />
    </article>
  )
}
