import Image from 'next/image'
import { paths } from '@/config/paths'
import siteData from '@/data/site.json'
import { cn } from '@/utils/cn'
import { BackToTop } from './BackToTop'
import { LinkBtn } from './LinkBtn'

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
  return (
    <footer className='w-full'>
      <div className={cn('bg-foreground w-full px-4 md:px-10')}>
        <BackToTop />
        <div className='grid w-full items-center justify-center gap-12 py-10 lg:grid-cols-3 lg:gap-4'>
          <section className='max-w-md'>
            <div className='flex'>
              <h2 className='font-rubik-bubbles text-accent text-stroke-1 text-stroke-background block text-6xl uppercase md:text-7xl'>
                Frijol Mágico
              </h2>
              <Image
                src='/images/frijol.png'
                alt='Logo Frijol Mágico'
                width={120}
                height={100}
                className='mr-6 h-20 self-end md:h-fit'
              />
            </div>
            <p className='font-roboto-mono text-background/60 text-xs font-extralight tracking-wider uppercase'>
              Frijol Mágico es un espacio que reúne a las y los Ilustradores de
              la Región de Coquimbo, generando distintas instancias que ayuden a
              potenciar su trabajo.
            </p>
          </section>
          <section className='mx-auto flex items-center justify-center'>
            <Image
              src='/logos/logo-white.png'
              alt='Logo de la Asociación Cultural Frijol Mágico'
              width={200}
              height={200}
              className='h-20 w-fit'
            />
          </section>
          <nav className='text-background/80 flex items-center justify-center gap-12'>
            <div className='space-y-2'>
              <h4 className='wavy-underline text-background/60 uppercase'>
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
              <h4 className='wavy-underline text-background/60 uppercase'>
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
        <div className='border-background/20 text-background/50 font-roboto-mono grid h-fit border-t py-4 text-center text-xs md:grid-cols-3 md:text-left'>
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
    </footer>
  )
}
