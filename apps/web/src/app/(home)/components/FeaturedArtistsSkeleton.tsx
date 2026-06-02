import { StarIcon } from 'lucide-react'

export function FeaturedArtistsSkeleton() {
  return [...Array(3)].map((_, i) => (
    <div key={i} className='relative'>
      {/* Pseudonym skeleton */}
      <div className='bg-foreground/10 ml-2 h-6 w-36 animate-pulse rounded' />

      <div className='before:bg-foreground relative block size-50'>
        <StarIcon className='fill-accent stroke-foreground absolute top-0 right-0 z-10 size-8 translate-x-4 -translate-y-4 rotate-20 stroke-1 will-change-transform' />
        <div className='bg-foreground absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-150' />
        <div className='border-foreground relative overflow-hidden rounded-lg border-2'>
          {/* Image skeleton — same dimensions as the Next.js Image */}
          <div className='bg-foreground/10 size-50 animate-pulse' />
        </div>
      </div>
    </div>
  ))
}
