import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/shared/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { CardContent } from '@/shared/components/ui/card'
import { TeamTable } from './team-table'
import { getTeamData } from '../_lib/get-general-data'

export async function TeamContent() {
  const team = await getTeamData()

  if (!team) {
    return (
      <Alert variant='default'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>No se encontraron datos</AlertTitle>
        <AlertDescription>
          No se encontraron datos del equipo. Por favor, agrega miembros para
          comenzar.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <CardContent className='space-y-6'>
      <TeamTable initialData={team} />
    </CardContent>
  )
}
