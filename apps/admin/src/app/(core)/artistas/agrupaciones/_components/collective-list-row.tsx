'use client'

import { useState } from 'react'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { useCollectiveStore } from '../_store/use-collective-store'
import type {
  CollectiveRow,
  DeletedCollectiveRow
} from '../_types/collective.types'

interface CollectiveListRowProps {
  item: CollectiveRow | DeletedCollectiveRow
  isDeleted: boolean
  onDelete: (id: number) => void
  onRestore: (id: number) => void
}

function truncateDescription(value: string | null) {
  if (!value) return '-'
  if (value.length <= 60) return value
  return `${value.slice(0, 57)}...`
}

function formatDeletedAt(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export function CollectiveListRow({
  item,
  isDeleted,
  onDelete,
  onRestore
}: CollectiveListRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const openUpdateCollectiveDialog = useCollectiveStore(
    (state) => state.openUpdateCollectiveDialog
  )

  return (
    <>
      <TableRow className={cn(isDeleted && 'opacity-80')}>
        <TableCell className='font-medium'>{item.nombre}</TableCell>
        <TableCell
          className='max-w-[260px]'
          title={item.descripcion ?? undefined}
        >
          {truncateDescription(item.descripcion)}
        </TableCell>
        <TableCell>{item.correo || '-'}</TableCell>
        <TableCell>
          <Badge variant='outline'>{item.activo ? 'Activa' : 'Inactiva'}</Badge>
        </TableCell>
        <TableCell>{item.memberCount}</TableCell>
        {isDeleted && 'deletedAt' in item ? (
          <TableCell>{formatDeletedAt(item.deletedAt)}</TableCell>
        ) : null}
        <TableCell>
          <ActionMenuButton
            actions={
              isDeleted
                ? []
                : [
                    {
                      label: 'Ver detalle',
                      onClick: () =>
                        openUpdateCollectiveDialog(item as CollectiveRow)
                    }
                  ]
            }
            isDeleted={isDeleted}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onRestore={() => onRestore(item.id)}
          />
        </TableCell>
      </TableRow>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          onDelete(item.id)
          setIsDeleteDialogOpen(false)
        }}
        title='¿Eliminar agrupación?'
        description='La agrupación quedará oculta del listado principal hasta que la restaures.'
      />
    </>
  )
}
