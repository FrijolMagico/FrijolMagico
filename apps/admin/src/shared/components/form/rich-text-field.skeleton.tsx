import { Skeleton } from '../ui/skeleton'

export function RichTextFieldSkeleton() {
  return (
    <div className='flex flex-col gap-3'>
      <Skeleton className='h-4 w-20' />
      <Skeleton className='h-56 w-full' />
    </div>
  )
}
