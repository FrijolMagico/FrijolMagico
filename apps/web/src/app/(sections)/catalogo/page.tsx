import { Header } from '@/components/Header'
import { TrackPageView } from '@/components/analytics/TrackPageView'
import { ContextBar } from '@/components/context-bar/ContextBar'
import { paths } from '@/config/paths'
import siteData from '@/data/site.json'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  CatalogCardLoader,
  CatalogSearchSectionLoader
} from './components/CatalogSkeletonLoaders'
import { CatalogFiltersInitializer } from './components/CatalogFiltersInitializer'
import { CatalogListServer } from './components/catalog-list-server'
import { CatalogPanelServer } from './components/catalog-panel-server'
import { CatalogSearchServer } from './components/catalog-search-server'

const { catalog } = siteData

export const metadata: Metadata = {
  title: catalog.seo.title,
  description: catalog.seo.description
}

export default function CatalogPage() {
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
        <Suspense fallback={<CatalogSearchSectionLoader />}>
          <CatalogSearchServer />
        </Suspense>
        <Suspense fallback={<CatalogCardLoader />}>
          <CatalogListServer />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <CatalogPanelServer />
      </Suspense>
      <ContextBar />
    </>
  )
}
