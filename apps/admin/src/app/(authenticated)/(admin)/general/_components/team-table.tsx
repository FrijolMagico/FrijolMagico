'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { useProjectionSync } from '@/shared/hooks/use-projection-sync'

import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import { TeamItem } from './team-item'

import type { TeamMember } from '../_types'

interface TeamTableProps {
  initialData: TeamMember[]
}

export function TeamTable({ initialData }: TeamTableProps) {
  const teamIds = useTeamProjectionStore((s) => s.allIds)

  useProjectionSync<TeamMember>({
    initialData,
    operationStore: useTeamOperationStore,
    projectionStore: useTeamProjectionStore
  })

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
        {teamIds.map((id) => (
          <TeamItem key={id} id={id} />
        ))}
      </TableBody>
    </Table>
  )
}
