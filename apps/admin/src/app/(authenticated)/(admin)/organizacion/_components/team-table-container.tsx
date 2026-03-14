import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'

import { EmptyState } from '@/shared/components/empty-state'
import { getTeamData } from '../_lib/get-general-data'
import { TeamRow } from './team-row'

export async function TeamTableContainer() {
  console.log('[DBG:TABLE-CONTAINER] rendered (server)')
  const team = await getTeamData()

  if (!team) {
    return (
      <EmptyState
        title='Error al cargar los miembros del equipo'
        description='No se pudo cargar la información de los miembros del equipo.'
        action={{
          label: 'Intentar otra vez',
          onClick: async () => await getTeamData()
        }}
      />
    )
  }

  if (team.length <= 0)
    return (
      <EmptyState
        title='Aún no hay miembros en el equipo'
        description='Agrega miembros al equipo para que aparezcan aquí.'
      />
    )

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader className='bg-muted'>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className='w-[15%]'>Cargo</TableHead>
            <TableHead className='w-[20%]'>Correo</TableHead>
            <TableHead className='w-[15%]'>Teléfono</TableHead>
            <TableHead className='w-[15%]'>RUT</TableHead>
            <TableHead className='w-[5%]'>RRSS</TableHead>
            <TableHead className='w-[5%]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.map((member) => (
            <TeamRow key={member.id} member={member} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
