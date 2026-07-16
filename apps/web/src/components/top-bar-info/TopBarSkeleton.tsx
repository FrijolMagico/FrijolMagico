import { cn } from '@/utils/cn'

export function TopBarSkeleton() {
  return (
    <section
      aria-label='Cargando información'
      className={cn(
        'bg-primary fixed top-0 z-40 flex w-full flex-col items-center justify-between space-y-4 px-4 py-4 font-sans sm:flex-row sm:px-6 sm:py-2 md:top-0 md:space-y-0'
      )}
    >
      <div className='flex flex-nowrap space-x-4'>
        <div className='h-[1.25lh] w-64 animate-pulse rounded bg-white/20' />
      </div>
      <div className='bg-accent/70 rounded-lg px-4 py-0.5 font-bold text-white/70'>
        ...
      </div>
    </section>
  )
}
