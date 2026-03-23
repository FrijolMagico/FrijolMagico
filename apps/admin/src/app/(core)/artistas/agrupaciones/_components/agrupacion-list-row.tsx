'use client'

import { useState } from 'react'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { useAgrupacionDialogStore } from '../_store/agrupacion-dialog-store'
import type { AgrupacionRow, DeletedAgrupacionRow } from '../_types/agrupacion'

interface AgrupacionListRowProps {
  item: AgrupacionRow | DeletedAgrupacionRow
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

export function AgrupacionListRow({
  item,
  isDeleted,
  onDelete,
  onRestore
}: AgrupacionListRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const openUpdateDialog = useAgrupacionDialogStore(
    (state) => state.openUpdateDialog
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
                      label: 'Editar',
                      onClick: () => openUpdateDialog(item as AgrupacionRow)
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
