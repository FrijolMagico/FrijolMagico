'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'

import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import { TeamRow } from './team-row'
import { useAutoCommit } from '@/shared/ui-state/operation-log/hooks/use-auto-commit'

import { Card } from '@/shared/components/ui/card'
import { EmptyState } from '@/shared/components/empty-state'

export function TeamTable() {
  const teamIds = useTeamProjectionStore((s) => s.allIds)

  useAutoCommit(useTeamOperationStore)

  if (teamIds.length <= 0)
    return (
      <EmptyState
        title='Aún no hay miembros en el equipo'
        description='Agrega miembros al equipo para que aparezcan aquí.'
      />
    )

  return (
    <Card className='py-0'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[5%]'></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className='w-[15%]'>Cargo</TableHead>
            <TableHead className='w-[20%]'>Correo</TableHead>
            <TableHead className='w-[15%]'>Teléfono</TableHead>
            <TableHead className='w-[5%]'>RRSS</TableHead>
            <TableHead className='w-[5%]'></TableHead>
            <TableHead className='w-[5%]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamIds.map((id) => (
            <TeamRow key={id} id={id} />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
