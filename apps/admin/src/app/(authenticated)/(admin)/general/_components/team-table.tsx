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
import { useAutoCommit } from '@/shared/ui-state/operation-log/hooks/use-auto-commit'

import type { TeamMember } from '../_types'
import { Card } from '@/shared/components/ui/card'

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

  useAutoCommit(useTeamOperationStore)

  return (
    <Card className='py-0'>
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
    </Card>
  )
}
