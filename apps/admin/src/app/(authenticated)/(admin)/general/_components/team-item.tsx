'use client'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { RotateCcw, Trash2 } from 'lucide-react'
import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import { cn } from '@/lib/utils'

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
    <TableRow className={cn(member.__meta.isDeleted && 'bg-destructive/10')}>
      <TableCell>
        <Input
          value={member.nombre}
          onChange={(e) => update(id, { nombre: e.target.value })}
          placeholder='Nombre completo'
          className='h-8'
          required
        />
      </TableCell>
      <TableCell>
        <Input
          value={member.cargo || ''}
          onChange={(e) => update(id, { cargo: e.target.value })}
          placeholder='Ej: Coordinador'
          className='h-8'
          required
        />
      </TableCell>
      <TableCell>
        <Input
          value={member.rrss || ''}
          onChange={(e) => update(id, { rrss: e.target.value })}
          placeholder='@usuario'
          className='h-8'
        />
      </TableCell>
      <TableCell>
        {/* TODO: Cuando el member está en esatdo deleted, cambiar icono a restore y quitar estado deleted */}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            if (member.__meta.isDeleted) {
              restore(id)
            } else {
              remove(id)
            }
          }}
          className={cn(
            'text-destructive hover:text-destructive/80 h-8 w-8',
            member.__meta.isDeleted && 'text-green-500 hover:text-green-500/80'
          )}
        >
          {member.__meta.isDeleted ? (
            <RotateCcw />
          ) : (
            <Trash2 className='h-4 w-4' />
          )}
        </Button>
      </TableCell>
    </TableRow>
  )
}
