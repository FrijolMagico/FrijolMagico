'use client'

import { throttle, useQueryStates } from 'nuqs'
import { DeletedToggle } from '@/shared/components/deleted-toggle-list'
import { EmptyState } from '@/shared/components/empty-state'
import { PaginationControls } from '@/shared/components/pagination-controls'
import type { PaginatedResponse } from '@/shared/types/pagination'
import { useDeletedToggleList } from '@/shared/components/deleted-toggle-list/use-deleted-toggle-list'
import { deleteCollectiveAction } from '../_actions/delete-collective.action'
import { restoreCollectiveAction } from '../_actions/restore-collective.action'
import { collectiveQueryParams } from '../_lib/search-params'
import type {
  ArtistOption,
  CollectiveRow,
  DeletedCollectiveRow,
  MembersByCollectiveId
} from '../_types/collective.types'
import { CollectiveCreateDialog } from './collective-create-dialog'
import { CollectiveDetailDialog } from './collective-detail-dialog'
import { CollectiveListTable } from './collective-list-table'

interface CollectiveListContainerProps {
  activeCollectives: PaginatedResponse<CollectiveRow>
  deletedCollectives: PaginatedResponse<DeletedCollectiveRow>
  membersByCollectiveId: MembersByCollectiveId
  availableArtists: ArtistOption[] | null
}

export function CollectiveListContainer({
  activeCollectives,
  deletedCollectives,
  membersByCollectiveId,
  availableArtists
}: CollectiveListContainerProps) {
  const [params, setParams] = useQueryStates(collectiveQueryParams, {
    shallow: false,
    limitUrlUpdates: throttle(300)
  })

  const showDeleted = params.showDeleted ?? false

  const {
    visibleItems,
    handleDelete,
    handleRestore,
    deletedCount,
    toggleShowDeleted
  } = useDeletedToggleList({
    activeItems: activeCollectives.data,
    deletedItems: deletedCollectives.data,
    showDeleted,
    onShowDeletedChange: (nextShowDeleted) => {
      void setParams({
        page: 1,
        showDeleted: nextShowDeleted ? true : null
      })
    },
    getId: (item) => item.id,
    isDeleted: (item) => 'deletedAt' in item && item.deletedAt !== null,
    deleteItem: deleteCollectiveAction,
    restoreItem: restoreCollectiveAction,
    messages: {
      deleteSuccess: 'Agrupación eliminada correctamente',
      deleteError: 'No se pudo eliminar la agrupación',
      restoreSuccess: 'Agrupación restaurada correctamente',
      restoreError: 'No se pudo restaurar la agrupación'
    }
  })

  const pagination = showDeleted ? deletedCollectives : activeCollectives

  const emptyState = showDeleted ? (
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
          showDeleted={showDeleted}
          deletedCount={deletedCollectives.total || deletedCount}
          onToggle={toggleShowDeleted}
        />

        {!showDeleted && <CollectiveCreateDialog />}
      </div>

      <PaginationControls
        {...pagination}
        onPageChange={(page) => setParams({ page })}
        itemNoun='agrupaciones'
      />

      <CollectiveListTable
        items={visibleItems}
        isDeleted={showDeleted}
        onDelete={handleDelete}
        onRestore={handleRestore}
        emptyState={emptyState}
      />

      <PaginationControls
        {...pagination}
        onPageChange={(page) => setParams({ page })}
        itemNoun='agrupaciones'
      />

      <CollectiveDetailDialog
        membersByCollectiveId={membersByCollectiveId}
        availableArtists={availableArtists}
      />
    </article>
  )
}
