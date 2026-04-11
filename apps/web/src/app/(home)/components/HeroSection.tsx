import { LinkBtn } from '@/components/LinkBtn'
import { LogoHomeLink } from '@/components/LogoHomeLink'
import { paths } from '@/config/paths'
import { cn } from '@/utils/cn'
import { ViewTransition } from 'react'

const navItems = [
  { prefix: 'Historia', name: 'Festivales', href: paths.festival.base },
  { prefix: 'Asociación Cultural', name: 'Nosotros', href: paths.about },
  { prefix: 'Artistas', name: 'Catálogo', href: paths.catalog }
]

export function HeroSection() {
  return (
    <header className='mx-auto h-fit max-w-6xl space-y-10'>
      <section>
        <div className='relative h-fit w-full'>
          <h1 className='font-rubik-bubbles text-stroke-1 lg:text-stroke-2 text-stroke-foreground text-secondary text-center text-[5rem] leading-none uppercase md:text-[10rem] lg:text-[12rem]'>
            Frijol Mágico
          </h1>
          <ViewTransition name='transition-logo'>
            <LogoHomeLink className='absolute inset-0 size-18 md:size-fit' />
          </ViewTransition>
        </div>
        <p className='font-roboto-mono w-prose mx-auto max-w-xl px-2 text-center text-xs tracking-wide uppercase'>
          Espacio que reúne a las y los Ilustradores de la Región de Coquimbo,
          generando distintas instancias que ayuden a potenciar su trabajo.
        </p>
      </section>
      <nav>
        <ul className='grid gap-4 px-4 md:grid-cols-3'>
          {navItems.map((item) => {
            return (
              <li key={item.name} className={cn('relative text-center')}>
                <span className='font-roboto-mono text-sm font-light'>
                  {item.prefix}
                </span>
                <LinkBtn
                  href={item.href}
                  className='mx-auto'
                  size='xl'
                  withArrow
                >
                  {item.name}
                </LinkBtn>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
