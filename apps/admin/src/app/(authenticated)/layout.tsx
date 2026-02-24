import { SidebarProvider } from '@/shared/components/ui/sidebar'
import { PanelHeader } from '@/shared/components/panel-header'
import { PanelSidebar } from '@/shared/components/sidebar'
import { TooltipProvider } from '@/shared/components/ui/tooltip'

export default function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className='flex min-h-screen w-full'>
          <PanelSidebar />
          <div className='flex flex-1 flex-col'>
            <PanelHeader />
            <main className='bg-background w-full flex-1 p-6'>
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
