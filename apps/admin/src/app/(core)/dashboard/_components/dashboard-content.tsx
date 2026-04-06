import { Suspense } from 'react'

import {
  getDashboardArtistStats,
  getDashboardEventStats,
  getDashboardGrowthData,
  getDashboardDisciplineData,
  getDashboardTopArtists,
  getDashboardGeographicData
} from '../_lib/get-dashboard-stats'

import { DISCIPLINE_LABELS } from '../_constants'
import { DashboardWelcomeName } from './dashboard-user-info'
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

      <section className='grid w-full grid-cols-12 gap-6'>
        {/* Row 1: Hero KPI cards */}
        <DashboardKpiCards artistStats={artistStats} eventStats={eventStats} />

        {/* Row 2: Growth chart (3/4) + Data health (1/4) */}
        <FestivalGrowthChart data={growthData} />
        {artistStats && (
          <DashboardDataHealth completeness={artistStats.completeness} />
        )}

        {/* Row 3: Discipline donut (1/4) + Geography (1/4) + Top artists (2/4) */}
        <DisciplineDonutChart
          data={disciplineData}
          labels={DISCIPLINE_LABELS}
        />
        <DashboardGeography data={geoData} />
        <DashboardTopArtists artists={topArtists} />
      </section>
    </>
  )
}
