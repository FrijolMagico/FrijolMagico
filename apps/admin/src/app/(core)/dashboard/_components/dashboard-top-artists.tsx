import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import type { TopArtistEntry } from '../_types'

type Props = {
  artists: TopArtistEntry[]
}

export function DashboardTopArtists({ artists }: Props) {
  if (artists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Artistas Frecuentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            Sin participaciones registradas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artistas Frecuentes</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className='space-y-1'>
          {artists.map((artist, index) => (
            <li key={artist.id} className='flex items-center gap-3 text-sm'>
              <span className='text-muted-foreground w-2 font-medium'>
                {index + 1}
              </span>
              <span className='flex-1 truncate'>{artist.pseudonimo}</span>
              <span className='text-muted-foreground text-xs'>
                {artist.ediciones} ediciones
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
