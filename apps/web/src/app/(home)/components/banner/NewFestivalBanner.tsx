import Image from 'next/image'
import Link from 'next/link'

export function NewFestivalBanner({}) {
  const isDev = process.env.NODE_ENV === 'development'
  const baseUrl = isDev ? process.env.URL ?? '' : 'https://frijolmagico.cl'
  const festivalHref = `${baseUrl}/festivales/frijol-magico-xvi`

  return (
    <section
      data-banner-trigger
      className='group relative flex h-full w-full items-center justify-center overflow-hidden px-2'
    >
      <Link href={festivalHref}>
        <Image
          src='/sections/banner/banner.png'
          fill
          alt=''
          className='w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-70'
        />
      </Link>

      <div className='pointer-events-none absolute inset-0 z-500 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
        {/* Outer: pink = border, 10px cuts */}
        <div
          className='flex'
          style={{
            backgroundColor: 'rgb(204, 107, 195)',
            clipPath:
              'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)'
          }}
        >
          {/* Inner: blue = fill, 14px cuts (4px inside) */}
          <div
            className='font-canarina px-10 pt-6 pb-5 text-5xl leading-none font-bold tracking-wider text-white uppercase'
            style={{
              backgroundColor: 'rgb(21, 106, 214)',
              clipPath:
                'polygon(16px 6px, calc(100% - 16px) 6px, calc(100% - 6px) 16px, calc(100% - 6px) calc(100% - 16px), calc(100% - 16px) calc(100% - 6px), 16px calc(100% - 6px), 6px calc(100% - 16px), 6px 16px)'
            }}
          >
            Conoce a lxs participantes
          </div>
        </div>
      </div>
    </section>
  )
}
