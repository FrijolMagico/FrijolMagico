import { ArtistStoreLoader } from './_components/artist-store-loader'

export default function ArtistasLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArtistStoreLoader />
      {children}
    </>
  )
}
