import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { LogoutButton } from '@/shared/components/logout-button'
import { ModeToggle } from '@/shared/components/mode-toggle'

export function PanelHeader() {
  return (
    <header className='flex h-16 items-center gap-4 border-b px-4'>
      <SidebarTrigger className='cursor-pointer' />
      <div className='flex w-full items-center justify-between gap-4'>
        <section>
          <h1 className='text-foreground text-lg font-semibold'>
            Panel de Administración
          </h1>
          <p className='text-muted-foreground text-sm'>
            Asociación Cultural Frijol Mágico
          </p>
        </section>
        <div className='flex items-center gap-4'>
          <ModeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
