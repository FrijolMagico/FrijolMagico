'use client'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Trash2 } from 'lucide-react'
import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'

interface TeamItemProps {
  id: string
}

export function TeamItem({ id }: TeamItemProps) {
  const update = useTeamOperationStore((s) => s.update)
  const remove = useTeamOperationStore((s) => s.remove)
  const member = useTeamProjectionStore((s) => s.byId[id])

  return (
    <TableRow>
      <TableCell>
        <Input
          value={member?.nombre || ''}
          onChange={(e) => update(id, { nombre: e.target.value })}
          placeholder='Nombre completo'
          className='h-8'
          required
        />
      </TableCell>
      <TableCell>
        <Input
          value={member?.cargo || ''}
          onChange={(e) => update(id, { cargo: e.target.value })}
          placeholder='Ej: Coordinador'
          className='h-8'
          required
        />
      </TableCell>
      <TableCell>
        <Input
          value={member?.rrss || ''}
          onChange={(e) => update(id, { rrss: e.target.value })}
          placeholder='@usuario'
          className='h-8'
        />
      </TableCell>
      <TableCell>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => remove(id)}
          className='text-destructive hover:text-destructive/80 h-8 w-8'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </TableCell>
    </TableRow>
  )
}
