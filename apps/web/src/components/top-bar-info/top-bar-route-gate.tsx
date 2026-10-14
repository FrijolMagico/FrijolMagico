'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

interface TopBarRouteGateProps {
  children: ReactNode
}

export function TopBarRouteGate({ children }: TopBarRouteGateProps) {
  const pathname = usePathname()

  if (pathname === '/') return null

  return children
}
