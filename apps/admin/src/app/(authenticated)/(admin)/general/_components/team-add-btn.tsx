'use client'

import { Button } from '@/shared/components/ui/button'
import { Plus } from 'lucide-react'
import { useTeamDialog } from '../_store/team-dialog-store'

export function TeamAddBtn() {
  const openDialog = useTeamDialog((state) => state.openDialog)

  return (
    <Button
      onClick={() => openDialog(null)}
      size='sm'
      variant='outline'
      className='gap-1'
    >
      <Plus className='h-4 w-4' />
      Agregar miembro
    </Button>
  )
}
