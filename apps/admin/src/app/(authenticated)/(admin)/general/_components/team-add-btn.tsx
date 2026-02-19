'use client'

import { Button } from '@/shared/components/ui/button'
import { Plus } from 'lucide-react'
import { useOrganizacionEquipoUIStore } from '../_store/organizacion-equipo-ui-store'

export function TeamAddBtn() {
  const add = useOrganizacionEquipoUIStore((state) => state.add)

  const handleAddTeamMember = () => {
    add(
      {
        nombre: '',
        cargo: '',
        rrss: '',
        isNew: true
      },
      null
    )
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
