'use client'

import { Input } from '@/shared/components/ui/input'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import { cn } from '@/lib/utils'
import { ButtonWithTooltip } from '@/shared/components/button-with-tooltip'
import { RotateCcw, Trash2 } from 'lucide-react'

interface TeamItemProps {
  id: string
}

export function TeamItem({ id }: TeamItemProps) {
  const update = useTeamOperationStore((s) => s.update)
  const remove = useTeamOperationStore((s) => s.remove)
  const restore = useTeamOperationStore((s) => s.restore)
  const member = useTeamProjectionStore((s) => s.byId[id])

  if (!member) return null

  return (
    <TableRow
      className={cn(
        member.__meta.isDeleted && 'bg-destructive/10 hover:bg-destructive/20'
      )}
    >
      <TableCell>
        <Input
          value={member.nombre}
          onChange={(e) => update(id, { nombre: e.target.value })}
          placeholder='Nombre completo'
          className='h-8'
          required
          disabled={member.__meta.isDeleted}
        />
      </TableCell>
      <TableCell>
        <Input
          value={member.cargo || ''}
          onChange={(e) => update(id, { cargo: e.target.value })}
          placeholder='Ej: Coordinador'
          className='h-8'
          required
          disabled={member.__meta.isDeleted}
        />
      </TableCell>
      <TableCell>
        <Input
          value={member.rrss || ''}
          onChange={(e) => update(id, { rrss: e.target.value })}
          placeholder='@usuario'
          className='h-8'
          disabled={member.__meta.isDeleted}
        />
      </TableCell>
      <TableCell>
        <ButtonWithTooltip
          size='icon'
          variant='ghost'
          onClick={() => {
            if (member.__meta.isDeleted) {
              restore(id)
            } else {
              remove(id)
            }
          }}
          tooltipContent={member.__meta.isDeleted ? 'Restaurar' : 'Eliminar'}
          className={cn(
            'text-destructive hover:text-destructive/80 h-8 w-8',
            member.__meta.isDeleted && 'text-green-500 hover:text-green-500/80'
          )}
        >
          {member.__meta.isDeleted ? <RotateCcw /> : <Trash2 />}
        </ButtonWithTooltip>
      </TableCell>
    </TableRow>
  )
}
