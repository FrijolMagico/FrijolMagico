import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { TrackPageView } from '@/components/analytics/TrackPageView'
import { getActiveFestival } from '@/data/data-access-layer/festivals/getActiveFestival'

import { getFestivalBySlug } from './lib/getFestivalBySlug'
import { getFestivalSlugs } from './lib/getFestivalSlugs'

import { FestivalDetailContent } from './components/FestivalDetailContent'
import { FestivalNavigator } from './components/FestivalNavigator'
import { ActiveFestivalDetailAnimation } from './components/active-animation/active-festival-detail-animation'

export async function generateStaticParams() {
  const slugs = await getFestivalSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  if (!slug) {
    return {
      title: 'Festival no encontrado | Asociación Cultural Frijol Mágico'
    }
  }

  const detail = await getFestivalBySlug(slug)

  if (!detail) {
    return {
      title: 'Festival no encontrado | Asociación Cultural Frijol Mágico'
    }
  }

  const title = `${detail.evento.nombre ?? 'Edición'} ${detail.numero_edicion} | Asociación Cultural Frijol Mágico`
  const description = `Participantes y actividades de ${detail.evento.nombre} ${detail.numero_edicion}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: detail.poster_url ? [{ url: detail.poster_url }] : []
    }
  }
}

export default async function FestivalDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!slug) notFound()

  const detail = await getFestivalBySlug(slug)

  if (!detail) notFound()

  let isActiveFestival = false
  try {
    const activeResult = await getActiveFestival()
    isActiveFestival = activeResult.data?.[0]?.slug === detail.slug
  } catch {
    isActiveFestival = false
  }

  const navigator = (
    <Suspense fallback={null}>
      <FestivalNavigator slug={detail.slug} />
    </Suspense>
  )

  return (
    <>
      <TrackPageView
        sectionName={`Festivales - ${detail.evento.nombre}`}
        sectionPath={`/festivales/${slug}`}
      />
      <main>
        {isActiveFestival ? (
          <ActiveFestivalDetailAnimation slug={detail.slug}>
            <FestivalDetailContent
              palette={`ffm-${detail.numero_edicion.toLowerCase()}`}
              detail={detail}
              navigator={navigator}
              animationMode='active'
            />
          </ActiveFestivalDetailAnimation>
        ) : (
          <FestivalDetailContent detail={detail} navigator={navigator} />
        )}
      </main>
    </>
  )
}
