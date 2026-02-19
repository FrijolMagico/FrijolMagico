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
import { useTeamEffectiveData } from '../_hooks/use-team-ui'
import { RawTeamMember } from '../_types'
import { useOrganizacionEquipoUIStore } from '../_store/organizacion-equipo-ui-store'
import { useAutoJournal } from '@/shared/ui-state/entity-state/hooks/use-auto-journal'

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
  const setRemoteData = useOrganizacionEquipoUIStore(
    (state) => state.setRemoteData
  )

  const update = useOrganizacionEquipoUIStore((state) => state.update)
  const remove = useOrganizacionEquipoUIStore((state) => state.remove)
  const commitCurrentEdits = useOrganizacionEquipoUIStore(
    (state) => state.commitCurrentEdits
  )
  // Quiz sea mejor obbtener la entidad completa (entities, ids)
  const equipo = useTeamEffectiveData()

  // This custom hook is not managing lists of entities
  const { handleChange, handleBlur } = useAutoJournal({
    // data: equipo
    // Tenemos dos opciones, o permitimos que autoJournal maneje los dos formatos de datos (entidades con una sola entry a modo e objeto o con múltiples entries a modo de arreglos de entry)
    // O refactorizamos el effectiveData para que devuelva siempre el mismo tipo de dato Entity y en componentes la manejamos (con check intermedio, si + de 1 item -> se puede iterar, si sólo 1 item (organizacion), podemos obtener y desestructurar)
    actions: {
      update,
      save: commitCurrentEdits
    }
  })

  useEffect(() => {
    setRemoteData(initialData)
  }, [initialData, setRemoteData])

  console.log('(UI)[TeamTable]: ', {
    equipo
  })

  const handleDeleteMember = (memberId?: number) => {
    if (!memberId) return

    // ** Estos comentarios osn puramente reflexivos y serán eliminados una vez resueltos**
    // Quizá sea buena idea inyectar en el entity el entityId para efectos de selección en UI
    // Otra alternativa es utilizar solo el id remoto para definir entityIds, manteniendo lógica para valores nuvos = id negativa
    // Analisis de edge cases para determinar mejor opción (separar entityId de id asignado por db o unificar ids remoto -> entityId)
    // A priori, con la opción de utilizar id de remoto en UI, ebo mantere concistencia al guardar en remoto
    // Esto porque cuando se hagan lo inserts la db asignada ids, pero en UI no sabremos cuáles son esos datos
    // Aunque ne realidad al guardar revalidamos cache, el usuario al guardar debería volver a traer los datos de remoto
    // Con esto también nos damos cuenta que el sistema tiene un gap importante
    // Inicialmente queríamos que cuando el usuario guardara en remoto borraramos los datos del journal, en currentEdits tecnicamente ya no hay inforamción porque esta se limpia
    // a medida que guardamos en journal, el punto es que cunado guardamos en remoto y limpiamos el journal, la data en appliedchanges se mantiene?
    // si no se mantuviera perderíamos visibilidad en la UI de los datos editamos
    // No deberíamos borrarla (aunque journal esté vacío)
    // Entonces, cuándo se borra appliedChanges?
    // Con el revalidate, en la siguiente request vamos a cachear la información, pero esatmos definiendo satale-while-revalidate
    // Por lo tanto el siguiente request igual verá data vieja
    // O manejamos una revalidación inmediata y no servimo data stale <- mejor, peor UX pero permitido en panel admin.
    // Entonces qué hacemos? forzamos un refresh para volver a traernos la data nueva de la db?
    const member = equipo.find((m) => m.id === memberId)

    if (member?.isNew) {
      remove(memberId)
    } else {
      update({ isDeleted: true }, memberId)
    }
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
        {equipo.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <Input
                value={member.nombre}
                onBlur={(e) => handleBlur('nombre', e.currentTarget.value)}
                onChange={(e) =>
                  // Quizá sea buena idea pasarle el entityId a a la entry o
                  // Sólo manejar qu eentityIds corresponda a las ids de remoto
                  handleChange('nombre', e.target.value, member.id || null)
                }
                placeholder='Nombre completo'
                className='h-8'
                required
              />
            </TableCell>
            <TableCell>
              <Input
                value={member.cargo || ''}
                onBlur={(e) => handleBlur('nombre', e.currentTarget.value)}
                onChange={(e) =>
                  handleChange('cargo', e.target.value, member.id || null)
                }
                placeholder='Ej: Coordinador'
                className='h-8'
                required
              />
            </TableCell>
            <TableCell>
              <Input
                value={member.rrss || ''}
                onBlur={(e) => handleBlur('nombre', e.currentTarget.value)}
                onChange={(e) =>
                  handleChange('rrss', e.target.value, member.id || null)
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
