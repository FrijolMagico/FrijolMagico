import { Suspense } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  getDashboardArtistStats,
  getDashboardEventStats,
  getDashboardGrowthData,
  getDashboardDisciplineData,
  getDashboardTopArtists,
  getDashboardGeographicData
} from '../_lib/get-dashboard-stats'
import { DISCIPLINE_LABELS } from '../_constants'
import {
  DashboardSessionExpiration,
  DashboardUserEmail,
  DashboardUserName,
  DashboardWelcomeName
} from './dashboard-user-info'
import { DashboardKpiCards } from './dashboard-kpi-cards'
import { FestivalGrowthChart } from './festival-growth-chart'
import { DashboardDataHealth } from './dashboard-data-health'
import { DisciplineDonutChart } from './discipline-donut-chart'
import { DashboardGeography } from './dashboard-geography'
import { DashboardTopArtists } from './dashboard-top-artists'

export async function DashboardContent() {
  const [
    artistResult,
    eventResult,
    growthResult,
    disciplineResult,
    topArtistsResult,
    geoResult
  ] = await Promise.allSettled([
    getDashboardArtistStats(),
    getDashboardEventStats(),
    getDashboardGrowthData(),
    getDashboardDisciplineData(),
    getDashboardTopArtists(),
    getDashboardGeographicData()
  ])

  const artistStats =
    artistResult.status === 'fulfilled' ? artistResult.value : null
  const eventStats =
    eventResult.status === 'fulfilled' ? eventResult.value : null
  const growthData =
    growthResult.status === 'fulfilled' ? (growthResult.value ?? []) : []
  const disciplineData =
    disciplineResult.status === 'fulfilled'
      ? (disciplineResult.value ?? [])
      : []
  const topArtists =
    topArtistsResult.status === 'fulfilled'
      ? (topArtistsResult.value ?? [])
      : []
  const geoData =
    geoResult.status === 'fulfilled' ? (geoResult.value ?? []) : []

  return (
    <>
      {/* Header — PRESERVED */}
      <header>
        <h1 className='text-foreground text-2xl font-bold'>Dashboard</h1>

        <p className='text-muted-foreground'>
          Bienvenido,{' '}
          <Suspense
            fallback={
              <span className='bg-muted inline-block h-4 w-20 animate-pulse rounded-xl' />
            }
          >
            <DashboardWelcomeName />
          </Suspense>
          . Gestiona el contenido de Frijol Mágico desde aquí.
        </p>
      </header>

      {/* Session card — PRESERVED */}
      <section className='flex flex-wrap gap-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>Información de Sesión</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Nombre:</span>
              <Suspense fallback={<Skeleton className='h-4 w-42' />}>
                <DashboardUserName />
              </Suspense>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Email:</span>
              <Suspense fallback={<Skeleton className='h-4 w-38' />}>
                <DashboardUserEmail />
              </Suspense>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Sesión expira:</span>
              <Suspense fallback={<Skeleton className='h-4 w-48' />}>
                <DashboardSessionExpiration />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Row 1: Hero KPI cards */}
      <section>
        <DashboardKpiCards artistStats={artistStats} eventStats={eventStats} />
      </section>

      {/* Row 2: Growth chart (3/4) + Data health (1/4) */}
      <section className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        <div className='lg:col-span-3'>
          <FestivalGrowthChart data={growthData} />
        </div>
        <div className='lg:col-span-1'>
          <DashboardDataHealth
            completeness={artistStats?.completeness ?? null}
          />
        </div>
      </section>

      {/* Row 3: Discipline donut (1/4) + Geography (1/4) + Top artists (2/4) */}
      <section className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div className='lg:col-span-1'>
          <DisciplineDonutChart
            data={disciplineData}
            labels={DISCIPLINE_LABELS}
          />
        </div>
        <div className='lg:col-span-1'>
          <DashboardGeography data={geoData} />
        </div>
        <div className='lg:col-span-2'>
          <DashboardTopArtists artists={topArtists} />
        </div>
      </section>
    </>
  )
}
