import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { TrackPageView } from '@/components/analytics/TrackPageView'

import { getFestivalBySlug } from './lib/getFestivalBySlug'
import { getFestivalSlugs } from './lib/getFestivalSlugs'
import { getAdjacentFestivals } from './lib/getAdjacentFestivals'

import { FestivalDetailContent } from './components/FestivalDetailContent'
import { FestivalNavigator } from './components/FestivalNavigator'

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
    return { title: 'Festival no encontrado | Frijol Mágico' }
  }

  const detail = await getFestivalBySlug(slug)

  if (!detail) {
    return { title: 'Festival no encontrado | Frijol Mágico' }
  }

  const title = `${detail.edicion_nombre ?? `Edición ${detail.numero_edicion}`} - ${detail.evento.nombre} | Frijol Mágico`
  const description = `Participantes y actividades de ${detail.evento.nombre}.`

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

  return (
    <>
      <TrackPageView
        sectionName={`Festivales - ${detail.evento.nombre}`}
        sectionPath={`/festivales/${slug}`}
      />
      <FestivalDetailContent detail={detail} />
    </>
  )
}
