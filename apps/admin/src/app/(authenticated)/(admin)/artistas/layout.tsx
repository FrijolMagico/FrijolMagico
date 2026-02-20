import { ArtistContent } from './_components/artist-content'

export default function ArtistasLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArtistContent />
      {children}
    </>
  )
}
