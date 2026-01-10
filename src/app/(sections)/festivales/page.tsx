import { Header } from '@/components/Header'
import { ErrorSection } from '@/components/ErrorSection'
import siteData from '@/data/site.json'
import { getFestivalesData } from './lib/getFestivalesData'
import { FestivalesTimeline } from './components/FestivalesTimeline'
import { Footer } from '@/components/Footer'
import { TrackPageView } from '@/components/analytics/TrackPageView'
import { ViewTransition } from 'react'
import { SectionHomeButton } from '@/components/SectionsHomeButton'

const festivals = siteData.festivals

export default async function FestivalesPage() {
  const { data: festivales, error } = await getFestivalesData()

  return (
    <>
      <TrackPageView sectionName='Festivales' sectionPath='/festivales' />
      <ViewTransition name='transition-logo'>
        <SectionHomeButton />
      </ViewTransition>
      <Header
        title={festivals.title}
        subTitle={festivals.subtitle}
        description={festivals.description}
      />

      {error ? (
        <ErrorSection error={error.message} />
      ) : (
        <FestivalesTimeline festivales={festivales} />
      )}
      <Footer />
    </>
  )
}
