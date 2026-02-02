import { paths } from '@/config/paths'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export const NosotrosCard = () => {
  return (
    <Link
      href={paths.about}
      aria-label='Ir a la sección de Nosotros'
      className='border-fm-black/80 hover:border-fm-green bg-fm-white hover:bg-fm-green hover:text-fm-white flex h-full flex-col items-center justify-center rounded-xl border border-dashed p-2 text-center transition-colors'>
      <h2 className='font-noto text-3xl leading-none font-bold'>
        Nosotros <ArrowUpRight className='-ml-1 inline-block size-6' />
      </h2>
      <p className='text-sm'>Asociación Cultural Frijol Mágico</p>
    </Link>
  )
}
