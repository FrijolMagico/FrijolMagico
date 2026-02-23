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
import { TeamItem } from './team-item'
import { useAutoCommit } from '@/shared/ui-state/operation-log/hooks/use-auto-commit'

import { Card } from '@/shared/components/ui/card'

export function TeamTable() {
  const teamIds = useTeamProjectionStore((s) => s.allIds)

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
