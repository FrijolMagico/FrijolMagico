import { Suspense } from 'react'
import { DashboardContent } from './_components/dashboard-content'
import { Skeleton } from '@/shared/components/ui/skeleton'

function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-32' />
        <Skeleton className='mt-2 h-4 w-64' />
      </div>
      <div className='grid grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-28 w-full rounded-xl' />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <article className='space-y-6'>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </article>
  )
}
