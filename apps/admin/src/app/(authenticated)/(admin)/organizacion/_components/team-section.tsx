import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/shared/components/ui/card'

import { AddMember } from './add-member'
import { IconUserFilled } from '@tabler/icons-react'
import { TeamTableContainer } from './team-table-container'

export function TeamSection() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='flex items-center gap-2'>
          <IconUserFilled className='h-5 w-5' />
          Equipo
        </CardTitle>
        <AddMember />
      </CardHeader>

      <CardContent className='space-y-6'>
        <TeamTableContainer />
      </CardContent>
    </Card>
  )
}
