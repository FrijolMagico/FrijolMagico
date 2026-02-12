'use client'

import { Button } from '@/shared/components/ui/button'
import { Plus } from 'lucide-react'
import { useTeamActions } from '../_hooks/use-team-ui'

export function TeamAddBtn() {
  const { addOne } = useTeamActions()

  const handleAddTeamMember = () => {
    addOne({
      nombre: '',
      cargo: '',
      rrss: '',
      isNew: true
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
