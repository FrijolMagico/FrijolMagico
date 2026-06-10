import { LinkBtn } from '@/components/LinkBtn'
import { paths } from '@/config/paths'
import { cn } from '@/utils/cn'
import Image from 'next/image'

const navItems = [
  { prefix: 'Historia', name: 'Festivales', href: paths.festival.base },
  { prefix: 'Asociación Cultural', name: 'Nosotros', href: paths.about },
  { prefix: 'Artistas', name: 'Catálogo', href: paths.catalog }
]

export function HeroSection() {
  return (
    <header className='mx-auto h-fit max-w-6xl space-y-12'>
      <section className='flex flex-col items-center px-2'>
        <div className='relative w-fit lg:-mr-14'>
          <Image
            src='/logos/logotipo_asoc_2026_color.png'
            alt=''
            width={1428}
            height={814}
            className='mx-auto w-full lg:max-w-2xl'
            loading='eager'
          />
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
