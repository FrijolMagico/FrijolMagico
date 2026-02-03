'use client'

import { authClient } from '@/app/auth/lib/auth-client'
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
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className='rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50'
    >
      {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </button>
  )
}
