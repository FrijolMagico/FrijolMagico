import { IconAlertTriangle, IconUser } from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar'

interface ArtistAvatarProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  status?: 'default' | 'missing'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-24 w-24'
}

export function ArtistAvatar({
  src,
  alt,
  size = 'md',
  status = 'default',
  className
}: ArtistAvatarProps) {
  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={src ?? undefined} alt={alt} />
      {status === 'missing' ? (
        <AvatarFallback className='bg-destructive/20'>
          <IconAlertTriangle className='text-destructive h-4 w-4' />
        </AvatarFallback>
      ) : (
        <AvatarFallback className='bg-muted'>
          <IconUser className='text-muted-foreground h-4 w-4' />
        </AvatarFallback>
      )}
    </Avatar>
  )
}
