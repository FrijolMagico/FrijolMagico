'use client'

import Link from 'next/link'

export const CollectiveMemberLink = ({
  slug,
  name
}: {
  slug: string
  name: string
}) => {
  return (
    <Link href={`/catalogo/${slug}`} className='text-secondary hover:underline'>
      {name}
    </Link>
  )
}
