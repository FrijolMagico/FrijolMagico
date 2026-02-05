import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from './LogoutButton'

export function AdminHeader() {
  return (
    <header className='flex h-16 items-center gap-4 border-b bg-white px-4'>
      <SidebarTrigger className='cursor-pointer' />
      <Separator orientation='vertical' />
      <div className='flex w-full items-center justify-between gap-4'>
        <div>
          <h1 className='text-lg font-semibold text-gray-900'>
            Panel de Administración
          </h1>
          <p className='text-sm text-gray-500'>
            Asociación Cultural Frijol Mágico
          </p>
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}
