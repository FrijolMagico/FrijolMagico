import Link from 'next/link'
import { NewBadget } from './NewBadget'
import { ExternalLinkIcon } from 'lucide-react'
import Image from 'next/image'

export const GenericApplyCard = () => {
  return (
    <div className='text-fm-white group relative flex h-full flex-col gap-4 rounded-2xl border-2 border-[#003c91] bg-[#0073b8] p-4 text-center'>
      <NewBadget color='text-[#e664cd]' outlineColor='outline-[#003c91]' />
      <Image
        src='/icon_frijol_asoc_2026_color.png'
        width={100}
        height={100}
        alt='Icono del Festival Frijol Mágico 2026'
        className='absolute -top-10 right-0 left-0 z-0 mx-auto'
      />
      <div className='z-10 pt-8'>
        <p className='block rounded-xl px-2 py-1 text-2xl font-black text-[#a0c85a] uppercase transition duration-300 group-hover:bg-[#e664cd] sm:bg-transparent'>
          Convocatoria:
        </p>
        <p className='font-josefin block text-xl'>
          Creación de Afiche Oficial{' '}
          <strong>Festival Frijol Mágico 2026</strong>
        </p>
      </div>
      <Link
        href='https://drive.google.com/file/d/134sWOpUBxplRwzQHQM27RESKXMurLTfj/view?usp=sharing'
        referrerPolicy='no-referrer'
        target='_blank'
        className='bg-fm-white hover:text-fm-white relative block size-full h-full rounded-2xl border-2 border-[#003c91] text-[#e664cd] duration-300 hover:bg-[#003c91]'
      >
        <p className='flex h-full items-center justify-center font-black uppercase'>
          <span className='flex items-center gap-2 px-2 text-2xl transition duration-300'>
            Lee las Bases <ExternalLinkIcon />
          </span>
        </p>
      </Link>
      <Link
        href='https://forms.gle/ARFdjYmz3RbG9khV6'
        referrerPolicy='no-referrer'
        target='_blank'
        className='border-fm-white relative block size-full h-full rounded-2xl border-2 bg-[#e664cd] text-[#003c91] duration-300 hover:bg-[#003c91] hover:text-[#e664cd]'
      >
        <p className='flex h-full items-center justify-center font-black uppercase'>
          <span className='flex items-center gap-2 px-2 text-2xl transition duration-300'>
            Postula! <ExternalLinkIcon />
          </span>
        </p>
      </Link>
    </div>
  )
}
