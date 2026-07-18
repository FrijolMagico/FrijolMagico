import { CatalogPanel } from './components/CatalogPanel'
import { Header } from '@/components/Header'
import { CatalogList } from './components/CatalogList'
import { ErrorSection } from '@/components/ErrorSection'
import siteData from '@/data/site.json'
import { Suspense } from 'react'
import {
  CatalogCardLoader,
  CatalogSearchSectionLoader
} from './components/CatalogSkeletonLoaders'
import { CatalogSearchSection } from './components/CatalogSearchSection'
import { CatalogFiltersInitializer } from './components/CatalogFiltersInitializer'
import { getCatalogData } from './lib/getCatalogData'
import { Metadata } from 'next'
import { TrackPageView } from '@/components/analytics/TrackPageView'
import { paths } from '@/config/paths'
import { ContextBar } from '@/components/context-bar/ContextBar'

const { catalog } = siteData

export const metadata: Metadata = {
  title: catalog.seo.title,
  description: catalog.seo.description
}

export default async function CatalogPage() {
  const { data, error } = await getCatalogData()

  return (
    <>
      <TrackPageView
        sectionName={paths.home.sub.catalog.label}
        sectionPath={paths.home.sub.catalog.path}
      />
      <Header title={catalog.title} description={catalog.description} />
      <main className='container mx-auto w-full flex-1 px-4 pt-8 pb-16'>
        {/* Search and Filter Section */}
        <CatalogFiltersInitializer />
        {error ? (
          <ErrorSection error={error.message} />
        ) : (
          <>
            <Suspense fallback={<CatalogSearchSectionLoader />}>
              <CatalogSearchSection catalogData={data || []} />
            </Suspense>
            <Suspense fallback={<CatalogCardLoader />}>
              <CatalogList catalog={data || []} />
            </Suspense>
          </>
        )}
      </main>
      <CatalogPanel catalogData={data || []} />
      <ContextBar />
    </>
  )
}
