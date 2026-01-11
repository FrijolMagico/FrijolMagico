import Image from 'next/image'

import { Header } from '@/components/Header'
import siteData from '@/data/site.json'
import { ViewTransition } from 'react'
import { SectionHomeButton } from '@/components/SectionsHomeButton'
import { ErrorSection } from '@/components/ErrorSection'
import { Grid } from '@/components/Grid'
import { GridItem } from '@/components/GridItem'
import { getAboutData } from './lib/getAboutData'

import type { Metadata } from 'next'

const { about } = siteData

export const metadata: Metadata = {
  title: about.seo.title,
  description: about.seo.description,
}

export default async function NosotrosPage() {
  const { data, error } = await getAboutData()

  return (
    <>
      <ViewTransition name='transition-logo'>
        <SectionHomeButton />
      </ViewTransition>
      <Header
        title={about.title}
        subTitle={about.subtitle}
        description={about.description}
      />
      <main className='container mx-auto w-full max-w-5xl px-4 py-12'>
        {error ? (
          <ErrorSection error={error.message} />
        ) : (
          <Grid
            row={{ base: 4, md: 3 }}
            col={{ base: 1, md: 2 }}
            className='place-items-center gap-6 md:gap-8'>
            {/* Fila 1: Misión (izq) + Imagen 1 (der) */}
            <GridItem
              row={{ base: 1 }}
              col={{ base: 1 }}
              className='order-0 flex items-center'>
              <article className='space-y-3'>
                <h2 className='font-noto text-fm-orange text-right text-5xl font-black lg:text-7xl'>
                  Misión
                </h2>
                <p className='text-fm-black text-right text-sm leading-relaxed lg:text-lg'>
                  {data?.mision}
                </p>
              </article>
            </GridItem>
            <GridItem
              row={{ base: 1 }}
              col={{ base: 1 }}
              className='order-1 md:order-0'>
              <div className='relative aspect-square w-full overflow-hidden rounded-2xl'>
                <Image
                  src='/sections/nosotros/frijol-1.webp'
                  alt='Imágen de una edición de Festival Frijol Mágico en el Centro Cultural Santa Inés'
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
              </div>
            </GridItem>

            {/* Fila 2: Imagen 2 (izq) + Visión (der) */}
            <GridItem
              row={{ base: 1 }}
              col={{ base: 1 }}
              className='order-3 md:order-0'>
              <div className='relative aspect-square w-full overflow-hidden rounded-2xl'>
                <Image
                  src='/sections/nosotros/frijol-2.webp'
                  alt='Imágen de una edición de Festival Frijol Mágico al aire libre'
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
              </div>
            </GridItem>
            <GridItem
              row={{ base: 1 }}
              col={{ base: 1 }}
              className='order-2 flex items-center md:order-0'>
              <article className='space-y-3'>
                <h2 className='font-noto text-fm-orange text-5xl font-black lg:text-7xl'>
                  Visión
                </h2>
                <p className='text-fm-black text-sm leading-relaxed lg:text-lg'>
                  {data?.vision}
                </p>
              </article>
            </GridItem>

            {/* Fila 3: Imagen 3 (ancho completo) */}
            <GridItem
              row={{ base: 1 }}
              col={{ base: 1, md: 2 }}
              className='order-4 h-fit md:order-0'>
              <div className='relative h-90 w-full overflow-hidden rounded-2xl lg:h-120'>
                <Image
                  src='/sections/nosotros/equipo.webp'
                  alt='Equipo de Frijol Mágico frente a mural del festival'
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 100vw'
                />
              </div>
            </GridItem>
          </Grid>
        )}
      </main>
    </>
  )
}
