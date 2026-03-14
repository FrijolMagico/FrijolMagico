import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/shared/components/ui/card'

import { IconUserFilled } from '@tabler/icons-react'
import { TeamTableContainer } from './team-table-container'
import { TeamMemberCreate } from './team-member-create'
import { TeamMemberUpdate } from './team-member-update'

export function TeamSection() {
  console.log('[DBG:TEAM-SECTION] rendered')
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='flex items-center gap-2'>
          <IconUserFilled className='h-5 w-5' />
          Equipo
        </CardTitle>
        <TeamMemberCreate />
      </CardHeader>

      <CardContent className='space-y-6'>
        <TeamTableContainer />
        <TeamMemberUpdate />
      </CardContent>
    </Card>
  )
}
