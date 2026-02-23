import { CardContent } from '@/shared/components/ui/card'
import { TeamStoreInitialization } from './team-store-initialization'
import { TeamTable } from './team-table'
import { getTeamData } from '../_lib/get-general-data'
import { EmptyState } from '@/shared/components/empty-state'

export async function TeamContent() {
  const team = await getTeamData()

  if (!team) {
    return (
      <EmptyState
        title='Error al cargar el equipo'
        description='No se pudo cargar la información del equipo.'
        action={{
          label: 'Intentar otra vez',
          onClick: async () => {
            // A way to retry to get data
          }
        }}
      />
    )
  }

  return (
    <CardContent className='space-y-6'>
      <TeamStoreInitialization initialData={team} />
      <TeamTable />
    </CardContent>
  )
}
