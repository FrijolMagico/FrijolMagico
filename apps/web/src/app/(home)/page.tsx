import { getFeaturedArtists } from '@/data/data-access-layer/featured-artists/getFeaturedArtists'
import { ApplyBanner } from './components/ApplyBanner'
import { FissureBanner } from './components/FissureBanner'
import { HeroSection } from './components/HeroSection'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'
import Image from 'next/image'
import { StarIcon } from 'lucide-react'
import { DoodleLine } from '@/components/DoodleLine'
import { LinkBtn } from '@/components/LinkBtn'
import { paths } from '@/config/paths'

export default async function Home() {
  const featuredArtists = await getFeaturedArtists()

  return (
    <>
      <FissureBanner height={400}>
        <ApplyBanner
          title='Postulación'
          description='Frijol Mágico: Módulos de formación profesional'
          buttons={{
            apply: {
              text: 'Postula aquí',
              href: 'https://docs.google.com/forms/d/e/1FAIpQLSdHPZtRBDqlOFjXvoU06BMrZcrvnKPQIdRzdffev4dMdwZr0Q/viewform',
              target: '_blank'
            },
            bases: {
              text: 'Lee las Bases',
              href: 'https://drive.google.com/file/d/162s1nFGUmIXdvY1D8ubKAOdgU4fu9_ye/view?usp=sharing',
              target: '_blank'
            }
          }}
          palette='ffm-xvi'
        />
      </FissureBanner>
      <main
        data-palette='base'
        className='mx-auto h-full w-full space-y-12 py-12'
      >
        <HeroSection />
        <DoodleLine color='text-primary' loopCount={4} />
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
            <section className='mx-auto flex flex-col flex-wrap items-center justify-center gap-6 md:flex-row md:gap-12'>
              {!featuredArtists || featuredArtists.length === 0 ? (
                <p className='text-foreground/60 mx-auto block w-full max-w-lg pt-10 text-center'>
                  No hay artistas destacados en este momento. ¡Vuelve pronto
                  para descubrir algunxs de lxs mejores artistas de la Región!
                </p>
              ) : (
                featuredArtists.map((artist) => (
                  <div key={artist.slug} className='relative'>
                    <h3 className='font-roboto-mono ml-2 text-lg font-medium uppercase'>
                      {artist.pseudonimo}
                    </h3>
                    <div
                      // href={`/artistas/${artist.slug}`}
                      className='before:bg-foreground relative block size-50'
                    >
                      <StarIcon className='fill-accent stroke-foreground absolute top-0 right-0 z-10 size-8 translate-x-4 -translate-y-4 rotate-20 stroke-1 will-change-transform' />
                      <div className='bg-foreground absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-150 group-hover:translate-0'></div>
                      <div className='border-foreground group relative overflow-hidden rounded-lg border-2'>
                        <Image
                          src={getAvatarUrl(artist.imagen_url)}
                          alt={`${artist.pseudonimo} avatar`}
                          width={200}
                          height={200}
                          className='size-full object-cover duration-150'
                        />

                        {/* <span className='bg-primary text-background border-foreground font-roboto-mono absolute top-0 right-0 bottom-0 left-0 m-auto flex size-fit items-center justify-center gap-2 rounded border px-2 py-2 leading-none opacity-0 duration-150 group-hover:opacity-100'> */}
                        {/*   Ver más <ArrowRight className='size-4' /> */}
                        {/* </span> */}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
        <DoodleLine color='text-primary' loopCount={4} />
      </main>
    </>
  )
}
