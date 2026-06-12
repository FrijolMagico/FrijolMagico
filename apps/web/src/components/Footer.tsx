import { useId } from 'react'
import Image from 'next/image'

import { paths } from '@/config/paths'
import siteData from '@/data/site.json'
import { FissureEdgeDecoration } from '@/components/fissure/FissureEdgeDecoration'
import { createFissureMaskStyle } from '@/components/fissure/mask'

import { BackToTop } from './BackToTop'
import { LinkBtn } from './LinkBtn'

/**
 * Altura del viewBox para el mask y la decoración.
 * Ambos usan el mismo valor para que el estiramiento con
 * preserveAspectRatio="none" sea idéntico y los paths se alineen.
 */
const FISSURE_VIEWBOX_HEIGHT = 400

const navLinks = [
  { name: 'Inicio', href: paths.home },
  { name: 'Festivales', href: paths.festival.base },
  { name: 'Catálogo', href: paths.catalog },
  { name: 'Nosotros', href: paths.about }
]

const socialLinks = [
  { name: 'Instagram', href: siteData.social_media.ig },
  { name: 'Facebook', href: siteData.social_media.fb },
  { name: 'Youtube', href: siteData.social_media.yt },
  { name: 'Spotify', href: siteData.podcast }
]

export const Footer = () => {
  const baseId = useId().replace(/:/g, '')
  const maskStyle = createFissureMaskStyle(FISSURE_VIEWBOX_HEIGHT)

  return (
    <footer className='relative w-full overflow-hidden'>
      <div
        className='relative left-1/2 grid w-screen min-w-7xl -translate-x-1/2'
        style={{ gridTemplateAreas: '"content"' }}
      >
        <div
          className='bg-primary flex flex-col items-center'
          style={{ gridArea: 'content', ...maskStyle }}
        >
          <div className='flex w-full max-w-svw flex-1 flex-col px-4 lg:px-10'>
            <BackToTop />
            <div className='space-y-4 pt-24 md:pt-8'>
              <div className='mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-4 md:flex-row lg:py-4'>
                <section className='max-w-sm space-y-2'>
                  <Image
                    src='https://cdn.frijolmagico.cl/asoc/logos/logotipo_white.png'
                    alt='Logo de la Asociación Cultural Frijol Mágico'
                    width={300}
                    height={173}
                    className='mx-auto w-64'
                    loading='lazy'
                  />
                  <p className='font-roboto-mono text-background/80 text-center text-[10px] font-extralight tracking-wide uppercase md:text-left lg:px-2'>
                    Frijol Mágico es un espacio que reúne a las y los
                    Ilustradores de la Región de Coquimbo, generando distintas
                    instancias que ayuden a potenciar su trabajo.
                  </p>
                </section>
                <nav className='text-background/80 flex items-center justify-center gap-12'>
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
                </nav>
              </div>
              <div className='border-background/20 text-background/50 font-roboto-mono mt-auto grid h-fit border-t py-4 text-center text-xs md:grid-cols-3 md:text-left'>
                <p>2026 | Asociación Cultural Frijol Mágico </p>
                <p className='text-center'>v4.0.0</p>
                <p className='text-center md:text-right'>
                  Desarrollado por{' '}
                  <a target='_blank' href='https://github.com/Strocs'>
                    Strocsdev
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className='pointer-events-none relative z-10'
          style={{ gridArea: 'content' }}
        >
          <FissureEdgeDecoration
            position='top'
            height={FISSURE_VIEWBOX_HEIGHT}
            bottomOffset={0}
            maskId={`${baseId}-mask`}
            blurId={`${baseId}-blur`}
          />
        </div>
      </div>
    </footer>
  )
}
