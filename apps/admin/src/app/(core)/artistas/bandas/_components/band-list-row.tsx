'use client'

import { useState } from 'react'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { useBandDialogStore } from '../_store/band-dialog-store'
import type { BandRow, DeletedBandRow } from '../_types/band'

interface BandListRowProps {
  band: BandRow | DeletedBandRow
  onEdit: (band: BandRow) => void
  onDelete: (id: number) => void
  onRestore: (id: number) => void
  isDeletedView: boolean
}

function truncateDescription(value: string | null) {
  if (!value) return '-'
  if (value.length <= 50) return value
  return `${value.slice(0, 47)}...`
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

export function BandListRow({
  band,
  onEdit,
  onDelete,
  onRestore,
  isDeletedView
}: BandListRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const openUpdateBandDialog = useBandDialogStore(
    (state) => state.openUpdateBandDialog
  )

  const location = [band.city, band.country].filter(Boolean).join(', ') || '-'

  return (
    <>
      <TableRow className={cn(isDeletedView && 'opacity-80')}>
        <TableCell className='font-semibold'>{band.name}</TableCell>
        <TableCell
          className='max-w-[220px]'
          title={band.description ?? undefined}
        >
          {truncateDescription(band.description)}
        </TableCell>
        <TableCell>{location}</TableCell>
        <TableCell>{band.email || '-'}</TableCell>
        <TableCell>
          <div className='flex flex-col gap-1'>
            <Badge variant='outline'>
              {band.active ? 'Activa' : 'Inactiva'}
            </Badge>
            {isDeletedView && 'deletedAt' in band ? (
              <span className='text-muted-foreground text-xs'>
                Eliminado el: {formatDeletedAt(band.deletedAt)}
              </span>
            ) : null}
          </div>
        </TableCell>
        <TableCell>
          <ActionMenuButton
            actions={
              isDeletedView
                ? []
                : [
                    {
                      label: 'Editar',
                      onClick: () => {
                        openUpdateBandDialog(band as BandRow)
                        onEdit(band as BandRow)
                      }
                    }
                  ]
            }
            isDeleted={isDeletedView}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onRestore={() => onRestore(band.id)}
          />
        </TableCell>
      </TableRow>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          onDelete(band.id)
          setIsDeleteDialogOpen(false)
        }}
        title='¿Eliminar banda?'
        description='La banda quedará oculta de la vista principal hasta que la restaures.'
      />
    </>
  )
}
