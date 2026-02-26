'use client'

import { LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'

import { authClient } from '@/lib/auth/'
import { DropdownMenuItem } from '@/shared/components/ui/dropdown-menu'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      await authClient.signOut()

      redirect('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      disabled={isLoading}
      variant='destructive'
      className='cursor-pointer text-nowrap'
    >
      <LogOut />
      {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </DropdownMenuItem>
  )
}
