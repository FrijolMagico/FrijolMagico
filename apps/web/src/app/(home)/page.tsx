import { ApplyBanner } from './components/ApplyBanner'
import { FissureBanner } from './components/FissureBanner'
import { HeroSection } from './components/HeroSection'
import { LinkBtn } from '@/components/LinkBtn'
import { paths } from '@/config/paths'
import bannerData from '@/data/banner_data.json'
import { Suspense } from 'react'
import { FeaturedArtists } from './components/FeaturedArtists'
import { FeaturedArtistsSkeleton } from './components/FeaturedArtistsSkeleton'

export default async function Home() {
  return (
    <>
      <main
        data-palette='base'
        className='mx-auto h-full w-full space-y-12 overflow-x-hidden py-12'
      >
        <HeroSection />

        <div className='pt-6'>
          <FissureBanner height={500}>
            <ApplyBanner
              title={bannerData.title}
              description={bannerData.description}
              buttons={{
                bases: {
                  text: bannerData.left_button.text,
                  href: bannerData.left_button.url,
                  target: '_blank'
                },
                apply: {
                  text: bannerData.right_button.text,
                  href: bannerData.right_button.url,
                  target: '_blank'
                }
              }}
              palette='ffm-xvi'
            />
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

              <LinkBtn withArrow href={paths.catalog}>
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
    </>
  )
}
