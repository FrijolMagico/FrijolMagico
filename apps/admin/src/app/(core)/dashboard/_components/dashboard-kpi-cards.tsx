import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import type { DashboardArtistStats, DashboardEventStats } from '../_types'
import {
  IconBook2,
  IconCalendar,
  IconTicketFilled,
  IconUsers
} from '@tabler/icons-react'

type Props = {
  artistStats: DashboardArtistStats | null
  eventStats: DashboardEventStats | null
}

export function DashboardKpiCards({ artistStats, eventStats }: Props) {
  const activeCount =
    artistStats?.byStatus.find((s) => s.slug === 'activo')?.count ?? 0
  const inactiveCount =
    artistStats?.byStatus.find((s) => s.slug === 'inactivo')?.count ?? 0

  const latestEdition = eventStats?.latestEdition

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Total de Artistas</CardTitle>
          <IconUsers className='size-4' />
        </CardHeader>
        <CardContent>
          <p className='text-4xl font-bold'>{artistStats?.total ?? '—'}</p>
          <p className='text-muted-foreground text-xs'>
            {activeCount} activos · {inactiveCount} inactivos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Participaciones Históricas</CardTitle>
          <IconTicketFilled className='h-4 w-4' />
        </CardHeader>
        <CardContent>
          <p className='text-4xl font-bold'>
            {eventStats?.totalParticipations ?? '—'}
          </p>
          <p className='text-muted-foreground text-xs'>
            En {eventStats?.totalEditions ?? '—'} ediciones
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Catálogo Activo</CardTitle>
          <IconBook2 className='h-4 w-4' />
        </CardHeader>
        <CardContent>
          <p className='text-4xl font-bold'>
            {artistStats?.catalogActive ?? '—'}
          </p>
          <p className='text-muted-foreground text-xs'>
            Artistas en catálogo público
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Última Edición</CardTitle>
          <IconCalendar className='h-4 w-4' />
        </CardHeader>
        <CardContent>
          <p className='text-4xl font-bold'>
            {latestEdition
              ? `Festival ${latestEdition.numeroEdicion} ${latestEdition.nombre ?? ''}`
              : '—'}
          </p>
          <p className='text-muted-foreground text-xs'>
            {latestEdition
              ? `${latestEdition.participantCount} participantes`
              : 'Sin datos'}
          </p>
        </CardContent>
      </Card>
    </>
  )
}
