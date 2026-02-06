'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import { OrganizacionEquipoTable } from './OrganizacionEquipoTable'
import { useOrganizacionForm } from '../_hooks/useOrganizacionForm'

export function OrganizacionEquipoSection() {
  const equipo = useOrganizacionForm((state) => state.formData.equipo)
  const addEquipoMember = useOrganizacionForm((state) => state.addEquipoMember)

  // Filter out deleted members for display
  const visibleEquipo = equipo.filter((member) => !member.isDeleted)

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          Equipo
        </CardTitle>
        <Button
          onClick={addEquipoMember}
          size='sm'
          variant='outline'
          className='gap-1'
        >
          <Plus className='h-4 w-4' />
          Agregar miembro
        </Button>
      </CardHeader>
      <CardContent>
        {visibleEquipo.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            <p>No hay miembros en el equipo.</p>
            <p className='text-sm'>
              Haz clic en &quot;Agregar miembro&quot; para comenzar.
            </p>
          </div>
        ) : (
          <OrganizacionEquipoTable />
        )}
      </CardContent>
    </Card>
  )
}
