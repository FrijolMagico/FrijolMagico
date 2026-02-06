'use client'

import { authClient } from '@/app/(auth)/lib/auth-client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await authClient.signOut()
      window.location.href = '/login'
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
