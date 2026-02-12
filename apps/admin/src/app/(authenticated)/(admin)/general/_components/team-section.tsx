import { Suspense } from 'react'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Users } from 'lucide-react'
import { TeamContent } from './team-content'
import { TeamAddBtn } from './team-add-btn'

export function TeamSection() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          Equipo
        </CardTitle>
        <TeamAddBtn />
      </CardHeader>

      <Suspense
        fallback={
          <div className='text-muted-foreground p-4'>Cargando equipo...</div>
        }
      >
        <TeamContent />
      </Suspense>
    </Card>
  )
}
