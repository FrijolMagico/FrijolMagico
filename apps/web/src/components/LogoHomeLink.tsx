import Image from 'next/image'
import Link from 'next/link'
import { paths } from '@/config/paths'
import { cn } from '@/utils/cn'

interface LogoHomeLinkProps {
  className?: string
}

export const LogoHomeLink = ({ className }: LogoHomeLinkProps) => {
  return (
    <Link
      href={paths.home}
      target='_self'
      aria-label='Ir a la página de inicio'
      className={cn('group relative m-auto block size-fit', className)}
    >
      <Image
        src='/images/frijol.png'
        loading='eager'
        alt='Logo Frijol Mágico'
        width={120}
        height={120}
        className='transition duration-200 group-hover:rotate-6'
      />
    </Link>
  )
}
