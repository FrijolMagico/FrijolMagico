'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useOrganizacionForm } from '../_hooks/useOrganizacionForm'

export function OrganizacionEquipoTable() {
  const equipo = useOrganizacionForm((state) => state.formData.equipo)
  const updateEquipoMember = useOrganizacionForm(
    (state) => state.updateEquipoMember
  )
  const removeEquipoMember = useOrganizacionForm(
    (state) => state.removeEquipoMember
  )

  // Filter out deleted members for display
  const visibleEquipo = equipo.filter((member) => !member.isDeleted)

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[35%]'>Nombre</TableHead>
            <TableHead className='w-[35%]'>Cargo</TableHead>
            <TableHead className='w-[25%]'>RRSS</TableHead>
            <TableHead className='w-[5%]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleEquipo.map((member) => {
            // Find the actual index in the full equipo array
            const actualIndex = equipo.findIndex((m) => m === member)

            return (
              <TableRow key={actualIndex}>
                <TableCell>
                  <Input
                    value={member.nombre}
                    onChange={(e) =>
                      updateEquipoMember(actualIndex, 'nombre', e.target.value)
                    }
                    placeholder='Nombre completo'
                    className='h-8'
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={member.cargo}
                    onChange={(e) =>
                      updateEquipoMember(actualIndex, 'cargo', e.target.value)
                    }
                    placeholder='Ej: Coordinador'
                    className='h-8'
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={member.rrss}
                    onChange={(e) =>
                      updateEquipoMember(actualIndex, 'rrss', e.target.value)
                    }
                    placeholder='@usuario'
                    className='h-8'
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => removeEquipoMember(actualIndex)}
                    className='h-8 w-8 text-red-500 hover:text-red-600'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
