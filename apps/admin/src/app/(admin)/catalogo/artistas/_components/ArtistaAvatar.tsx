'use client'

import { User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl } from '../_lib/cdn'

interface ArtistaAvatarProps {
  src: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
}

export function ArtistaAvatar({
  src,
  alt,
  size = 'md',
  className
}: ArtistaAvatarProps) {
  const avatarUrl = getAvatarUrl(src)

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={avatarUrl} alt={alt} />
      <AvatarFallback className="bg-gray-100">
        <User className="h-4 w-4 text-gray-400" />
      </AvatarFallback>
    </Avatar>
  )
}
