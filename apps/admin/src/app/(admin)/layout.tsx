import { redirect } from 'next/navigation'
import { getSession } from '@/app/(auth)/lib/get-session'
import { AdminHeader } from '@/app/(admin)/_components/AdminHeader'
import { AdminSidebar } from '@/app/(admin)/_components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full'>
        <AdminSidebar user={session.user} />
        <div className='flex flex-1 flex-col'>
          <AdminHeader />
          <main className='w-full flex-1 bg-gray-50/50 p-6'>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
