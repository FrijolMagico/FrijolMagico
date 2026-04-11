import type { Metadata } from 'next'
import {
  Fragment_Mono,
  Josefin_Sans,
  Noto_Sans,
  Roboto_Mono,
  Rubik,
  Rubik_Bubbles
} from 'next/font/google'
import localFont from 'next/font/local'

import siteData from '@/data/site.json'
import '@/styles/globals.css'
import { TopBarInfo } from '@/components/TopBarInfo'
import { Background } from '@/components/Background'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { cn } from '@/utils/cn'
import { Footer } from '@/components/Footer'

const SITE = siteData

const josefinSans = Josefin_Sans({
  variable: '--font-josefin-sans',
  subsets: ['latin']
})

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin']
})

const superFortress = localFont({
  src: '../../public/fonts/sections/festivales/2025/SuperFortress.woff2',
  variable: '--font-superfortress',
  display: 'swap'
})

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin']
})

const rubikBubbles = Rubik_Bubbles({
  weight: '400',
  variable: '--font-rubik-bubbles',
  subsets: ['latin']
})

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    images: [
      {
        url: SITE.image
      }
    ]
  },
  twitter: {
    title: SITE.title,
    description: SITE.description,
    card: 'summary_large_image',
    images: [
      {
        url: SITE.image
      }
    ]
  },
  icons: {
    icon: SITE.favicon
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={SITE.lang}>
      <body
        className={cn(
          'bg-background font-rubik relative flex size-full min-h-dvh flex-col antialiased',
          josefinSans.variable,
          notoSans.variable,
          superFortress.variable,
          rubik.variable,
          rubikBubbles.variable,
          robotoMono.variable
        )}
      >
        <GoogleAnalytics />
        <SpeedInsights />
        <Analytics />
        <Background />
        {SITE.top_bar.active && <TopBarInfo />}
        {children}
        <Footer />
      </body>
    </html>
  )
}
