import Markdown from 'react-markdown'

export interface ArtistBioFullProps {
  bio: string
}

export const ArtistBioFull = ({ bio }: ArtistBioFullProps) => {
  return (
    <section>
      <h2 className='text-primary text-lg font-bold'>Biografía</h2>
      <div className='text-foreground/80 prose prose-sm max-w-none'>
        <Markdown>{bio}</Markdown>
      </div>
    </section>
  )
}
