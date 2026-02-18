import { SidebarProvider } from '@/shared/components/ui/sidebar'
import { PanelHeader } from '@/shared/components/panel-header'
import { PanelSidebar } from '@/shared/components/sidebar'
import { UnsavedChangesNotification } from '@/shared/components/unsaved-changes-notification'

export default function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full'>
        <PanelSidebar />
        <div className='flex flex-1 flex-col'>
          <PanelHeader />
          <main className='bg-background w-full flex-1 p-6'>
            <UnsavedChangesNotification />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
