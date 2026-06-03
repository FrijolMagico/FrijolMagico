export function FeaturedArtistsSkeleton() {
  return [...Array(3)].map((_, i) => (
    <div key={i} className='relative space-y-2'>
      {/* Pseudonym skeleton */}
      <div className='bg-foreground/20 h-6 w-36 animate-pulse rounded' />

      <div className='relative block size-50'>
        <div className='bg-foreground/20 absolute -z-10 size-full animate-pulse rounded-lg duration-150' />
        <div className='relative overflow-hidden rounded-lg'>
          {/* Image skeleton — same dimensions as the Next.js Image */}
          <div className='bg-foreground/10 size-50 animate-pulse' />
        </div>
      </div>
    </div>
  ))
}
