import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getArtistBySlug } from '../lib/getArtistBySlug'
import { getCatalogData } from '../lib/getCatalogData'
import { ArtistBioFull } from './components/ArtistBioFull'
import { ArtistTimelineVisual } from './components/ArtistTimelineVisual'
import { ArtistCollectiveGrid } from './components/ArtistCollectiveGrid'
import { RelatedArtists } from './components/RelatedArtists'
import { TrackPageView } from '@/components/analytics/TrackPageView'
import { SectionHomeButton } from '@/components/SectionsHomeButton'

// Generate params for all artist pages at build time
export async function generateStaticParams() {
  const { data } = await getCatalogData()
  return data.map((artist) => ({ slug: artist.slug }))
}

// Generate dynamic metadata for each artist page
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  if (!slug) {
    return { title: 'Artista no encontrado — Catálogo · Frijol Mágico' }
  }

  const { data } = await getCatalogData()
  const artist = getArtistBySlug(data, slug)

  if (!artist) {
    return { title: 'Artista no encontrado — Catálogo · Frijol Mágico' }
  }

  const description = artist.bio
    ? artist.bio.replace(/[*_`#]/g, '').slice(0, 160)
    : `Conoce el perfil de ${artist.name} en el catálogo de Frijol Mágico.`

  return {
    title: `${artist.name} — Catálogo · Frijol Mágico`,
    description,
    openGraph: {
      title: artist.name,
      description,
      images: artist.avatar ? [{ url: artist.avatar }] : [],
      type: 'profile'
    }
  }
}

export default async function ArtistPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!slug) notFound()

  const { data: catalogData } = await getCatalogData()
  const artist = getArtistBySlug(catalogData, slug)
  if (!artist) notFound()

  return (
    <>
      <TrackPageView
        sectionName={`Catálogo - ${artist.name}`}
        sectionPath={`/catalogo/${slug}`}
      />
      <SectionHomeButton />
      <article className='container mx-auto max-w-4xl px-4 py-16'>
        <Link
          href='/catalogo'
          className='bg-background border-primary/20 text-primary hover:bg-primary/10 hover:border-primary mb-10 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all'
        >
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>

        <div className='flex flex-col gap-8 md:flex-row'>
          <aside className='md:sticky md:top-24 md:self-start'>
            <figure className='relative size-64 shrink-0 md:size-100'>
              <Image
                src={artist.avatar}
                alt={`Imagen de ${artist.name}`}
                fill
                className='border-primary rounded-xl border-2 object-cover shadow-xl'
                priority
                sizes='(max-width: 768px) 256px, 320px'
              />
            </figure>
          </aside>

          <div className='min-w-0 flex-1 space-y-8'>
            <header>
              <h1 className='text-primary text-4xl leading-tight font-bold md:text-6xl'>
                {artist.name}
              </h1>
              <p className='text-foreground/70 text-lg'>
                {artist.city}
                {artist.country ? `, ${artist.country}` : ''}
              </p>
              {artist.category && (
                <span className='bg-accent/20 text-accent mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-medium'>
                  {artist.category}
                </span>
              )}
              {artist.collective && (
                <p className='text-foreground/80 mt-3 text-sm'>
                  <span className='font-semibold'>Colectivo:</span>{' '}
                  {artist.collective}
                </p>
              )}
            </header>

            <ArtistBioFull bio={artist.bio} />
            <ArtistTimelineVisual editions={artist.editions} />
            <ArtistCollectiveGrid artist={artist} catalogData={catalogData} />

            <section>
              <h2 className='text-primary text-lg font-bold'>Contacto</h2>
              <div className='flex flex-wrap items-center gap-4 text-sm'>
                {artist.email && (
                  <a
                    href={`mailto:${artist.email}`}
                    className='hover:text-secondary text-foreground/70 transition-colors'
                  >
                    {artist.email}
                  </a>
                )}
                {artist.rrss && (
                  <a
                    href={artist.rrss}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-foreground/70 hover:text-secondary transition-colors'
                  >
                    Instagram ↗
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>

        <RelatedArtists artist={artist} catalogData={catalogData} />
      </article>
    </>
  )
}
