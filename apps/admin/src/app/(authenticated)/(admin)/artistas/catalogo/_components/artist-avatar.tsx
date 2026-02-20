import { User } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar'

interface ArtistAvatarProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
}

export function ArtistAvatar({
  src,
  alt,
  size = 'md',
  className
}: ArtistAvatarProps) {
  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className='bg-muted'>
        <User className='text-muted-foreground h-4 w-4' />
      </AvatarFallback>
    </Avatar>
  )
}
