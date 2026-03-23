'use client'

import { useMemo, useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/shared/components/ui/combobox'
import type { ArtistLookup } from '../_types/agrupacion'

interface ArtistComboboxItem extends ArtistLookup {
  label: string
}

interface AddMemberComboboxProps {
  artists: ArtistLookup[]
  onAdd: (artist: ArtistLookup) => void
}

export function AddMemberCombobox({ artists, onAdd }: AddMemberComboboxProps) {
  const [selectedArtist, setSelectedArtist] =
    useState<ArtistComboboxItem | null>(null)

  const items = useMemo<ArtistComboboxItem[]>(
    () =>
      artists.map((artist) => ({
        ...artist,
        label: artist.pseudonimo
      })),
    [artists]
  )

  return (
    <Combobox
      items={items}
      value={selectedArtist}
      onValueChange={(artist) => {
        setSelectedArtist(artist)

        if (!artist) {
          return
        }

        onAdd({
          id: artist.id,
          pseudonimo: artist.pseudonimo,
          ciudad: artist.ciudad
        })

        setSelectedArtist(null)
      }}
      itemToStringLabel={(item) => item?.label ?? ''}
      isItemEqualToValue={(item, value) => item.id === value.id}
    >
      <ComboboxInput placeholder='Buscar artista...' showTrigger showClear />
      <ComboboxContent className='pointer-events-auto!'>
        <ComboboxEmpty>No hay artistas disponibles</ComboboxEmpty>
        <ComboboxList>
          {(artist: ArtistComboboxItem) => (
            <ComboboxItem key={artist.id} value={artist}>
              <div className='flex flex-col'>
                <span>{artist.pseudonimo}</span>
                <span className='text-muted-foreground text-xs'>
                  {artist.ciudad || 'Sin ciudad'}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
