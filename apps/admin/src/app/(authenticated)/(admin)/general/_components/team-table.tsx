'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { Trash2 } from 'lucide-react'
import {
  useTeamActions,
  useTeamEffectiveData,
  type TeamMember
} from '../_hooks/use-team-ui'
import { RawTeamMember } from '../_types'

interface TeamTableProps {
  initialData: RawTeamMember[]
}

/**
 * Formulario de gestión de equipo.
 *
 * ## Flujo de Datos
 *
 * Este componente implementa el patrón de 3 capas de UI State con Entity State:
 *
 * 1. **Server Component** (`EquipoContent`) → fetch datos
 * 2. **Set Remote Data** → `setRemoteData(initialData)` en useEffect
 * 3. **User Actions** → `updateOne()` / `removeOne()` al editar/eliminar (LAYER 3)
 * 4. **Display** → `useTeamEffectiveData()` para obtener array efectivo
 */
export function TeamTable({ initialData }: TeamTableProps) {
  const { setRemoteData, updateOne, removeOne } = useTeamActions()
  const equipo = useTeamEffectiveData()

  useEffect(() => {
    setRemoteData(initialData)
  }, [initialData, setRemoteData])

  const handleDeleteMember = (memberId?: number) => {
    if (!memberId) return

    const member = equipo.find((m) => m.id === memberId)

    if (member?.isNew) {
      removeOne(memberId)
    } else {
      updateOne(memberId, { isDeleted: true })
    }
  }

  const handleFieldChange = (
    field: keyof Pick<TeamMember, 'nombre' | 'cargo' | 'rrss'>,
    value: string,
    memberId?: number
  ) => {
    console.log({ memberId })

    if (!memberId) return
    updateOne(memberId, { [field]: value })
  }

  return (
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
        {equipo.map((member, index) => (
          <TableRow key={String(member.id) + index}>
            <TableCell>
              <Input
                value={member.nombre}
                onChange={(e) =>
                  handleFieldChange('nombre', e.target.value, member.id)
                }
                placeholder='Nombre completo'
                className='h-8'
                required
              />
            </TableCell>
            <TableCell>
              <Input
                value={member.cargo || ''}
                onChange={(e) =>
                  handleFieldChange('cargo', e.target.value, member.id)
                }
                placeholder='Ej: Coordinador'
                className='h-8'
                required
              />
            </TableCell>
            <TableCell>
              <Input
                value={member.rrss || ''}
                onChange={(e) =>
                  handleFieldChange('rrss', e.target.value, member.id)
                }
                placeholder='@usuario'
                className='h-8'
              />
            </TableCell>
            <TableCell>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleDeleteMember(member.id)}
                className='text-destructive hover:text-destructive/80 h-8 w-8'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
