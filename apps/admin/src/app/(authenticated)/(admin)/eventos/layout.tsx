import { EventoStoreLoader } from './_components/evento-store-loader'

export default function EventosLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <EventoStoreLoader />
      {children}
    </>
  )
}
