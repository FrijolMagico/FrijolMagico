import Link from 'next/link'
import Image from 'next/image'

import type { User } from '@frijolmagico/database/orm'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from '@/components/ui/sidebar'
import { SidebarNavigationMenu } from './SidebarNavigationMenu'

// Better Auth may omit the image field entirely, making it undefined
type AuthUser = Omit<User, 'image'> & { image?: string | null }

interface AdminSidebarProps {
  user: AuthUser
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='h-16'>
        <Link href='/dashboard' className='flex h-full items-center gap-2'>
          <Image
            src='/logotipo_mono.png'
            alt='Logo Frijol Mágico'
            width={32}
            height={34}
            className='h-auto w-7.5 shrink-0'
          />
          <span className='truncate font-semibold text-gray-900'>
            Frijol Mágico
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className='px-2'>
        <SidebarNavigationMenu />
      </SidebarContent>

      <SidebarFooter className='border-t px-2 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
            {!user.image ? (
              <span className='text-xs font-medium text-gray-600'>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            ) : (
              <Image
                src={user.image}
                width={32}
                height={32}
                alt={`Imágen de ${user.name}`}
              />
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-gray-900'>
              {user.name}
            </p>
            <p className='truncate text-xs text-gray-500'>{user.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
