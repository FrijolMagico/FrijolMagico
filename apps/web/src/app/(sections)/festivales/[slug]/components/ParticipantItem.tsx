import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

interface ParticipantItemProps {
  pseudonimo: string
  catalogoSlug: string | null
}

export const ParticipantItem = ({
  pseudonimo,
  catalogoSlug
}: ParticipantItemProps) => {
  if (catalogoSlug) {
    return (
      <Link
        href={`/catalogo/${catalogoSlug}`}
        className='hover:text-link text-primary group mx-auto flex w-fit items-center gap-1 duration-200 md:mx-0'
      >
        {pseudonimo}
        <ArrowRightIcon className='size-4 opacity-50 duration-200 group-hover:-rotate-45' />
      </Link>
    )
  }

  return <span className='text-foreground/80'>{pseudonimo}</span>
}
