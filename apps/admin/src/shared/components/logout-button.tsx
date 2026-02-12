'use client'

import { authClient } from '@/lib/auth/'
import { Button } from '@/shared/components/ui/button'
import { redirect } from 'next/navigation'
import { useState } from 'react'

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
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      className='cursor-pointer'
      variant='destructive'
    >
      {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </Button>
  )
}
