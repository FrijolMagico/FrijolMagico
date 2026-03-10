import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Skeleton } from '../ui/skeleton'

interface PanelSidebarUserProps {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

export function PanelSidebarUser({ user }: PanelSidebarUserProps) {
  return (
    <>
      <Avatar>
        <AvatarImage
          src={user.image ?? undefined}
          alt={`Imagen de ${user.name}`}
        />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>

      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-medium'>{user.name}</span>
        <span className='truncate text-xs'>{user.email}</span>
      </div>
    </>
  )
}

export function PanelSidebarUserSkeleton() {
  return (
    <>
      <Skeleton className='h-8 w-8 shrink-0 rounded-full' />
      <div className='grid flex-1 gap-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-3 w-32' />
      </div>
    </>
  )
}
