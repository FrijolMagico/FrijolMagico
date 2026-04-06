'use client'

import { DeletedListTable } from '@/shared/components/deleted-toggle-list'
import { TableHead, TableRow } from '@/shared/components/ui/table'
import type { BandRow, DeletedBandRow } from '../_types/band'
import { BandListRow } from './band-list-row'

interface BandListTableProps {
  items: Array<BandRow | DeletedBandRow>
  showDeleted: boolean
  onEdit: (band: BandRow) => void
  onDelete: (id: number) => void
  onRestore: (id: number) => void
}

export function BandListTable({
  items,
  showDeleted,
  onEdit,
  onDelete,
  onRestore
}: BandListTableProps) {
  return (
    <div className='rounded-lg border'>
      <DeletedListTable
        items={items}
        getId={(band) => band.id}
        onDelete={onDelete}
        onRestore={onRestore}
        isDeletedView={showDeleted}
        columns={
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        }
        renderRow={(band, context) => (
          <BandListRow
            key={band.id}
            band={band}
            onEdit={onEdit}
            onDelete={() => context.onDelete()}
            onRestore={() => context.onRestore()}
            isDeletedView={context.isDeletedView}
          />
        )}
      />
    </div>
  )
}
