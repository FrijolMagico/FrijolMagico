import { IconUser } from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar'

interface ArtistAvatarProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
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
  className
}: ArtistAvatarProps) {
  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={src ?? undefined} alt={alt} />
      <AvatarFallback className='bg-muted'>
        <IconUser className='text-muted-foreground h-4 w-4' />
      </AvatarFallback>
    </Avatar>
  )
}
