import { FissureBanner } from './components/banner/FissureBanner'
import { HeroSection } from './components/HeroSection'
import { LinkBtn } from '@/components/LinkBtn'
import { paths } from '@/config/paths'
import { Suspense } from 'react'
import { FeaturedArtists } from './components/FeaturedArtists'
import { FeaturedArtistsSkeleton } from './components/FeaturedArtistsSkeleton'
import { Banner } from './components/banner'
import { ContextBar } from '@/components/context-bar/ContextBar'

export default async function Home() {
  return (
    <>
      <main
        data-palette='base'
        className='mx-auto h-full w-full space-y-12 overflow-x-hidden pt-24 md:py-12'
      >
        <HeroSection />

        <div className='pt-6'>
          <FissureBanner landscapeHeight={640} compactHeight={840}>
            <Banner />
          </FissureBanner>
        </div>
        <section className='mx-auto h-full max-w-6xl space-y-20 px-6'>
          <article className='space-y-10'>
            <div className='flex flex-col items-center gap-2'>
              <span className='font-roboto-mono text-foreground/60 before:border-foreground/20 relative h-fit text-xs leading-none font-light tracking-wider uppercase before:absolute before:-left-8 before:h-1/2 before:w-6 before:border-b before:content-[""]'>
                Curaduría Semanal
              </span>
              <h2 className='uppercase'>
                <span className='text-2xl font-medium tracking-wider'>
                  Artistas <br />
                </span>
                <strong className='text-secondary text-stroke-1 text-5xl leading-8 font-bold'>
                  Destacados
                </strong>
              </h2>
            </div>
            <section className='mx-auto flex flex-col flex-wrap items-center justify-center gap-6 pb-24 md:flex-row md:gap-12'>
              <Suspense fallback={<FeaturedArtistsSkeleton />}>
                <FeaturedArtists />
              </Suspense>

              <LinkBtn withArrow href={paths.home.sub.catalog.path}>
                Ver catálogo completo
              </LinkBtn>
            </section>
          </article>
          {/* <article> */}
          {/*   <div className='flex flex-col items-center gap-2'> */}
          {/*     <span className='font-roboto-mono text-foreground/60 before:border-foreground/20 relative h-fit text-xs leading-none font-light tracking-wider uppercase before:absolute before:-left-8 before:h-1/2 before:w-6 before:border-b before:content-[""]'> */}
          {/*       Calendario */}
          {/*     </span> */}
          {/**/}
          {/*     <h2 className='uppercase'> */}
          {/*       <span className='text-2xl font-medium tracking-wider'> */}
          {/*         Próximas <br /> */}
          {/*       </span> */}
          {/*       <strong className='text-primary text-5xl leading-8 font-bold'> */}
          {/*         Actividades */}
          {/*       </strong> */}
          {/*     </h2> */}
          {/*   </div> */}
          {/* </article> */}
        </section>
      </main>
      <ContextBar />
    </>
  )
}
