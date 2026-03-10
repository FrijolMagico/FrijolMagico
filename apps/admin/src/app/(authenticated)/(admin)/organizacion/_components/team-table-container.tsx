import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'

import { EmptyState } from '@/shared/components/empty-state'
import { TeamTableList } from './team-table-list'
import { getTeamData } from '../_lib/get-general-data'

export async function TeamTableContainer() {
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
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className='w-[15%]'>Cargo</TableHead>
            <TableHead className='w-[20%]'>Correo</TableHead>
            <TableHead className='w-[15%]'>Teléfono</TableHead>
            <TableHead className='w-[5%]'>RRSS</TableHead>
            <TableHead className='w-[5%]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TeamTableList initialData={team} />
        </TableBody>
      </Table>
    </div>
  )
}
