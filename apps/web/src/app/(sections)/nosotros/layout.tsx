import { Footer } from '@/components/Footer'

export default function NosotrosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}
