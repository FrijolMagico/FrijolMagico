export default function ArtistPageLoading() {
  return (
    <div className='animate-pulse'>
      {/* Hero skeleton */}
      <section className='container mx-auto px-4 pt-8 pb-12'>
        <div className='bg-muted mb-8 h-4 w-36 rounded' />
        <div className='flex flex-col items-center'>
          <div className='bg-muted mb-6 h-40 w-40 rounded-full' />
          <div className='bg-muted mb-2 h-10 w-64 rounded' />
          <div className='bg-muted h-6 w-48 rounded' />
          <div className='bg-muted mt-3 h-7 w-24 rounded-full' />
        </div>
      </section>

      {/* Bio skeleton */}
      <section className='container mx-auto max-w-3xl px-4 py-12'>
        <div className='bg-muted mx-auto mb-8 h-8 w-32 rounded' />
        <div className='space-y-3'>
          <div className='bg-muted h-4 w-full rounded' />
          <div className='bg-muted h-4 w-5/6 rounded' />
          <div className='bg-muted h-4 w-4/6 rounded' />
          <div className='bg-muted h-4 w-full rounded' />
          <div className='bg-muted h-4 w-3/4 rounded' />
        </div>
      </section>

      {/* Timeline skeleton */}
      <section className='container mx-auto max-w-3xl px-4 py-12'>
        <div className='bg-muted mx-auto mb-8 h-8 w-40 rounded' />
        <div className='space-y-6'>
          <div className='flex gap-2'>
            <div className='bg-muted h-6 w-16 rounded-full' />
            <div className='bg-muted h-6 w-20 rounded-full' />
            <div className='bg-muted h-6 w-24 rounded-full' />
          </div>
        </div>
      </section>
    </div>
  )
}
