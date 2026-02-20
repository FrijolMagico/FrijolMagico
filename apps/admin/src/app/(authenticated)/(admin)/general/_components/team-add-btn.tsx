'use client'

import { Button } from '@/shared/components/ui/button'
import { Plus } from 'lucide-react'
import { useTeamOperationStore } from '../_store/organization-team-ui-store'

export function TeamAddBtn() {
  const add = useTeamOperationStore((state) => state.add)

  const handleAddTeamMember = () => {
    add({
      nombre: '',
      cargo: '',
      rrss: ''
    })
  }

  return (
    <Button
      onClick={handleAddTeamMember}
      size='sm'
      variant='outline'
      className='gap-1'
    >
      <Plus className='h-4 w-4' />
      Agregar miembro
    </Button>
  )
}
