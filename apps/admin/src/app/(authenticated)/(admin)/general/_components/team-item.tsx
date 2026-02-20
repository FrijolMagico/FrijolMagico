'use client'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Trash2 } from 'lucide-react'
import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import { useAutoJournal } from '@/shared/hooks/use-auto-journal'

interface TeamItemProps {
  id: string
}

export function TeamItem({ id }: TeamItemProps) {
  const update = useTeamOperationStore((s) => s.update)
  const remove = useTeamOperationStore((s) => s.remove)
  const commitPendingOperations = useTeamOperationStore(
    (s) => s.commitPendingOperations
  )
  const member = useTeamProjectionStore((s) => s.byId[id])

  const { handleChange, handleBlur } = useAutoJournal({
    data: member,
    actions: {
      update,
      save: commitPendingOperations
    }
  })

  return (
    <TableRow>
      <TableCell>
        <Input
          value={member?.nombre || ''}
          onBlur={(e) => handleBlur('nombre', e.currentTarget.value, id)}
          onChange={(e) => handleChange('nombre', e.target.value, id)}
          placeholder='Nombre completo'
          className='h-8'
          required
        />
      </TableCell>
      <TableCell>
        <Input
          value={member?.cargo || ''}
          onBlur={(e) => handleBlur('cargo', e.currentTarget.value, id)}
          onChange={(e) => handleChange('cargo', e.target.value, id)}
          placeholder='Ej: Coordinador'
          className='h-8'
          required
        />
      </TableCell>
      <TableCell>
        <Input
          value={member?.rrss || ''}
          onBlur={(e) => handleBlur('rrss', e.currentTarget.value, id)}
          onChange={(e) => handleChange('rrss', e.target.value, id)}
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
