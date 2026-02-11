import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from '@/shared/components/ui/sonner'
import { ThemeProvider } from '@/shared/components/theme-provider'
import { Inter, Rubik_Bubbles } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const rubikBubble = Rubik_Bubbles({
  subsets: ['latin'],
  variable: '--font-rubik-bubbles',
  weight: '400'
})

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
    <html
      lang='es'
      suppressHydrationWarning
      className={`${inter.variable} ${rubikBubble.variable}`}
    >
      <body className='font-inter'>
        <ThemeProvider>
          {children}
          <Toaster position='top-right' />
        </ThemeProvider>
      </body>
    </html>
  )
}
