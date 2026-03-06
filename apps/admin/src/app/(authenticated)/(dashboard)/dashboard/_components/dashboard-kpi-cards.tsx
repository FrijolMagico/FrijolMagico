import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Users, Ticket, BookOpen, CalendarDays } from 'lucide-react'
import type { DashboardArtistStats, DashboardEventStats } from '../_types'

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
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-muted-foreground text-sm font-medium'>
            Total de Artistas
          </CardTitle>
          <Users className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>{artistStats?.total ?? '—'}</p>
          <p className='text-muted-foreground text-xs'>
            {activeCount} activos · {inactiveCount} inactivos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-muted-foreground text-sm font-medium'>
            Participaciones Históricas
          </CardTitle>
          <Ticket className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>
            {eventStats?.totalParticipations ?? '—'}
          </p>
          <p className='text-muted-foreground text-xs'>
            En {eventStats?.totalEditions ?? '—'} ediciones
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-muted-foreground text-sm font-medium'>
            Catálogo Activo
          </CardTitle>
          <BookOpen className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>
            {artistStats?.catalogActive ?? '—'}
          </p>
          <p className='text-muted-foreground text-xs'>
            Artistas en catálogo público
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-muted-foreground text-sm font-medium'>
            Última Edición
          </CardTitle>
          <CalendarDays className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>
            {latestEdition ? `Festival ${latestEdition.numeroEdicion}` : '—'}
          </p>
          <p className='text-muted-foreground text-xs'>
            {latestEdition
              ? `${latestEdition.participantCount} participantes`
              : 'Sin datos'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
