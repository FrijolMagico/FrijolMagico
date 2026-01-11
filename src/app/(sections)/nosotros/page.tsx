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
              className='flex items-center'>
              <article className='space-y-3'>
                <h2 className='font-noto text-fm-orange text-right text-2xl font-black md:text-7xl'>
                  Misión
                </h2>
                <p className='text-fm-black text-right text-base leading-relaxed md:text-lg'>
                  {data?.mision}
                </p>
              </article>
            </GridItem>
            <GridItem row={{ base: 1 }} col={{ base: 1 }}>
              {/* Imagen 1 placeholder */}
              <div className='aspect-square w-full rounded-2xl bg-neutral-200' />
            </GridItem>

            {/* Fila 2: Imagen 2 (izq) + Visión (der) */}
            <GridItem
              row={{ base: 1 }}
              col={{ base: 1 }}
              className='order-1 md:order-0'>
              {/* Imagen 2 placeholder */}
              <div className='aspect-square w-full rounded-2xl bg-neutral-200' />
            </GridItem>
            <GridItem
              row={{ base: 1 }}
              col={{ base: 1 }}
              className='flex items-center'>
              <article className='space-y-3'>
                <h2 className='font-noto text-fm-orange text-2xl font-black md:text-7xl'>
                  Visión
                </h2>
                <p className='text-fm-black text-base leading-relaxed md:text-lg'>
                  {data?.vision}
                </p>
              </article>
            </GridItem>

            {/* Fila 3: Imagen 3 (ancho completo) */}
            <GridItem
              row={{ base: 1 }}
              col={{ base: 1, md: 2 }}
              className='h-fit'>
              {/* Imagen 3 placeholder */}
              <div className='h-120 w-full rounded-2xl bg-neutral-200' />
            </GridItem>
          </Grid>
        )}
      </main>
    </>
  )
}
