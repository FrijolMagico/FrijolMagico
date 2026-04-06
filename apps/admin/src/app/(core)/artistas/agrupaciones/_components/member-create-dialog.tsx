'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/shared/components/ui/combobox'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { searchArtistsAction } from '../_actions/search-artists.action'
import { useCollectiveDraftStore } from '../_store/use-collective-draft-store'
import type { ArtistOption } from '../_types/collective.types'

function resetDialogState(
  setSelectedArtist: (artist: ArtistOption | null) => void,
  setRole: (role: string) => void,
  setSearch: (search: string) => void,
  setSearchResults: (results: ArtistOption[]) => void
) {
  setSelectedArtist(null)
  setRole('')
  setSearch('')
  setSearchResults([])
}

export function MemberCreateDialog() {
  const {
    isMemberCreateOpen,
    closeMemberCreate,
    addMember,
    availableArtists,
    existingMembers,
    pendingAdds
  } = useCollectiveDraftStore(
    useShallow((state) => ({
      isMemberCreateOpen: state.isMemberCreateOpen,
      closeMemberCreate: state.closeMemberCreate,
      addMember: state.addMember,
      availableArtists: state.availableArtists,
      existingMembers: state.existingMembers,
      pendingAdds: state.pendingAdds
    }))
  )

  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(
    null
  )
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<ArtistOption[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const selectedArtistIds = new Set([
    ...existingMembers.map((member) => member.artistId),
    ...pendingAdds.map((member) => member.artistId)
  ])

  const staticArtists =
    availableArtists?.filter((artist) => !selectedArtistIds.has(artist.id)) ??
    []

  const visibleSearchResults = searchResults.filter(
    (artist) => !selectedArtistIds.has(artist.id)
  )

  const closeDialog = () => {
    resetDialogState(setSelectedArtist, setRole, setSearch, setSearchResults)
    closeMemberCreate()
  }

  const handleSearch = async () => {
    const trimmedSearch = search.trim()

    if (!trimmedSearch) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      const result = await searchArtistsAction(trimmedSearch)
      setSearchResults(result)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'No se pudieron buscar artistas'
      )
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMember = () => {
    if (!selectedArtist) {
      toast.error('Seleccioná un artista para continuar')
      return
    }

    addMember({
      artistId: selectedArtist.id,
      pseudonym: selectedArtist.pseudonym,
      city: selectedArtist.city,
      role: role.trim() || null,
      active: true
    })

    closeDialog()
  }

  return (
    <Dialog
      open={isMemberCreateOpen}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Agregar miembro</DialogTitle>
          <DialogDescription>
            Seleccioná un artista y definí el rol que va a cumplir dentro de la
            agrupación.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {availableArtists ? (
            <div className='space-y-2'>
              <Label>Artista</Label>
              <Combobox
                items={staticArtists}
                value={selectedArtist}
                onValueChange={setSelectedArtist}
                itemToStringLabel={(item) => item?.pseudonym ?? ''}
                isItemEqualToValue={(item, value) => item.id === value.id}
              >
                <ComboboxInput
                  placeholder='Buscar artista...'
                  showTrigger
                  showClear
                />
                <ComboboxContent className='pointer-events-auto!'>
                  <ComboboxEmpty>No hay artistas disponibles</ComboboxEmpty>
                  <ComboboxList>
                    {(artist: ArtistOption) => (
                      <ComboboxItem key={artist.id} value={artist}>
                        <div className='flex flex-col'>
                          <span>{artist.pseudonym}</span>
                          <span className='text-muted-foreground text-xs'>
                            {artist.city || 'Sin ciudad'}
                          </span>
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='space-y-2'>
                <Label htmlFor='member-search'>Buscar artista</Label>
                <div className='flex gap-2'>
                  <Input
                    id='member-search'
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder='Escribe nombre o pseudónimo'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
                <p className='text-muted-foreground text-xs'>
                  Hay demasiados artistas para precargar, así que usa la
                  búsqueda puntual.
                </p>
              </div>

              <div className='max-h-56 space-y-2 overflow-y-auto rounded-lg border p-3'>
                {visibleSearchResults.length === 0 ? (
                  <p className='text-muted-foreground text-sm'>
                    {search.trim()
                      ? 'No encontramos artistas para esa búsqueda.'
                      : 'Ingresa un término para buscar artistas disponibles.'}
                  </p>
                ) : (
                  visibleSearchResults.map((artist) => {
                    const isSelected = selectedArtist?.id === artist.id

                    return (
                      <button
                        key={artist.id}
                        type='button'
                        className={
                          isSelected
                            ? 'bg-muted w-full rounded-md border p-3 text-left'
                            : 'w-full rounded-md border p-3 text-left'
                        }
                        onClick={() => setSelectedArtist(artist)}
                      >
                        <span className='block font-medium'>
                          {artist.pseudonym}
                        </span>
                        <span className='text-muted-foreground text-sm'>
                          {artist.city || 'Sin ciudad'}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='member-role'>Rol</Label>
            <Input
              id='member-role'
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder='Ej. Dirección artística'
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={closeDialog}>
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={handleAddMember}
            disabled={!selectedArtist}
          >
            Agregar miembro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
