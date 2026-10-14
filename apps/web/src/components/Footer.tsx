import Image from 'next/image'

import { paths } from '@/config/paths'
import siteData from '@/data/site.json'

import { APP_VERSION } from '@frijolmagico/utils/version'

import { BackToTop } from './BackToTop'
import { FissureFooter } from './footer/fissure-footer'
import { LinkBtn } from './LinkBtn'

const navLinks = [
  { name: 'Inicio', href: paths.home.path },
  { name: 'Festivales', href: paths.home.sub.festival.path },
  { name: 'Catálogo', href: paths.home.sub.catalog.path },
  { name: 'Nosotros', href: paths.home.sub.about.path }
]

const socialLinks = [
  { name: 'Instagram', href: siteData.social_media.ig },
  { name: 'Facebook', href: siteData.social_media.fb },
  { name: 'Youtube', href: siteData.social_media.yt },
  { name: 'Spotify', href: siteData.podcast }
]

export const Footer = () => (
  <FissureFooter>
    <div
      className='flex h-full w-full min-w-0 flex-col items-center justify-end px-4 lg:px-10'
      data-testid='footer-content'
    >
      <BackToTop />
      <div className='w-full min-w-0 space-y-4 pt-24 md:pt-8'>
        <div className='mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center justify-between gap-4 md:flex-row lg:py-4'>
          <section className='w-full min-w-0 max-w-sm space-y-2'>
            <Image
              src='https://cdn.frijolmagico.cl/asoc/logos/logotipo_white.png'
              alt='Logo de la Asociación Cultural Frijol Mágico'
              width={300}
              height={173}
              className='mx-auto w-64'
              loading='lazy'
            />
            <p className='font-roboto-mono text-background/80 text-center text-[10px] font-extralight tracking-wide uppercase md:text-left lg:px-2'>
              Frijol Mágico es un espacio que reúne a las y los Ilustradores de
              la Región de Coquimbo, generando distintas instancias que ayuden a
              potenciar su trabajo.
            </p>
          </section>
          <nav className='mt-4 flex min-w-0 flex-col items-center'>
            <div className='text-background/80 flex min-w-0 items-center justify-center gap-6 lg:gap-12'>
              <div className='space-y-2'>
                <h4 className='wavy-underline text-background uppercase'>
                  Síguenos
                </h4>
                <ul>
                  {socialLinks.map((link) => (
                    <li key={link.name}>
                      <LinkBtn
                        withArrow
                        href={link.href}
                        className='text-sm uppercase'
                      >
                        {link.name}
                      </LinkBtn>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='space-y-2'>
                <h4 className='wavy-underline text-background uppercase'>
                  Navegar
                </h4>
                <ul>
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <LinkBtn href={link.href}>{link.name}</LinkBtn>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              aria-label=''
              className='font-roboto-mono text-background/80 mt-2 text-xs underline-offset-2 hover:underline'
              href='mailto:contacto@frijolmagico.cl'
            >
              contacto@frijolmagico.cl
            </a>
          </nav>
        </div>
        <div className='border-background/20 text-background/50 font-roboto-mono mt-auto grid h-fit border-t py-4 text-center text-xs md:grid-cols-3 md:text-left'>
          <p>2026 | Asociación Cultural Frijol Mágico </p>
          <p className='text-center'>v{APP_VERSION}</p>
          <p className='text-center md:text-right'>
            Desarrollado por{' '}
            <a target='_blank' href='https://github.com/Strocs'>
              Strocsdev
            </a>
          </p>
        </div>
      </div>
    </div>
  </FissureFooter>
)
