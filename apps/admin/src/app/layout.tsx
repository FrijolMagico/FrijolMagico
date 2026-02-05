import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Frijol Mágico - Admin',
  description: 'Panel de administración',
  icons: {
    icon: '/logotipo_mono.png',
    apple: '/logotipo_mono.png'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='es' className={inter.className}>
      <body>
        {children}
        <Toaster position='top-right' richColors />
      </body>
    </html>
  )
}
