import { beforeEach, describe, expect, test } from 'bun:test'
import { useCollectiveDraftStore } from '@/core/artistas/agrupaciones/_store/use-collective-draft-store'
import { useCollectiveStore } from '@/core/artistas/agrupaciones/_store/use-collective-store'
import type {
  ArtistOption,
  CollectiveRow,
  MemberDraftItem
} from '@/core/artistas/agrupaciones/_types/collective.types'

const ORIGINAL_MEMBERS: MemberDraftItem[] = [
  {
    artistId: 1,
    pseudonym: 'Luna Roja',
    city: 'Valparaíso',
    role: 'Voz',
    active: true
  },
  {
    artistId: 2,
    pseudonym: 'Río Alto',
    city: 'Santiago',
    role: 'Percusión',
    active: true
  }
]

const AVAILABLE_ARTISTS: ArtistOption[] = [
  {
    id: 3,
    pseudonym: 'Cielo Sur',
    city: 'Concepción'
  }
]

const MOCK_COLLECTIVE: CollectiveRow = {
  id: 42,
  nombre: 'Los Magicos',
  descripcion: 'Un grupo increíble',
  correo: 'contacto@magicos.cl',
  activo: true,
  memberCount: 2,
  createdAt: '2024-01-01'
}

beforeEach(() => {
  useCollectiveStore.getState().closeUpdateCollectiveDialog()
  useCollectiveDraftStore.getState().reset()
})

describe('collective stores', () => {
  test('opens and closes the update dialog with the selected collective', () => {
    useCollectiveStore.getState().openUpdateCollectiveDialog(MOCK_COLLECTIVE)

    expect(useCollectiveStore.getState()).toMatchObject({
      isUpdateCollectiveOpen: true,
      selectedCollective: MOCK_COLLECTIVE
    })

    useCollectiveStore.getState().closeUpdateCollectiveDialog()

    expect(useCollectiveStore.getState()).toMatchObject({
      isUpdateCollectiveOpen: false,
      selectedCollective: null
    })
  })

  test('initializes and resets draft state without mutating original members', () => {
    useCollectiveDraftStore.getState().init(ORIGINAL_MEMBERS, AVAILABLE_ARTISTS)
    useCollectiveDraftStore.getState().updateMember(1, { role: 'Dirección' })

    expect(useCollectiveDraftStore.getState().originalMembers).toEqual(
      ORIGINAL_MEMBERS
    )
    expect(useCollectiveDraftStore.getState().existingMembers).toEqual([
      {
        artistId: 1,
        pseudonym: 'Luna Roja',
        city: 'Valparaíso',
        role: 'Dirección',
        active: true
      },
      ORIGINAL_MEMBERS[1]
    ])

    useCollectiveDraftStore.getState().reset()

    expect(useCollectiveDraftStore.getState()).toMatchObject({
      originalMembers: [],
      existingMembers: [],
      pendingAdds: [],
      isMemberCreateOpen: false,
      memberBeingEdited: null,
      availableArtists: null
    })
  })

  test('adds new members to pending adds and restores removed original members to existing members', () => {
    useCollectiveDraftStore.getState().init(ORIGINAL_MEMBERS, AVAILABLE_ARTISTS)
    useCollectiveDraftStore.getState().removeMember(1)

    useCollectiveDraftStore.getState().addMember({
      artistId: 3,
      pseudonym: 'Cielo Sur',
      city: 'Concepción',
      role: 'Bajo',
      active: true
    })
    useCollectiveDraftStore.getState().addMember({
      artistId: 1,
      pseudonym: 'Luna Roja',
      city: 'Valparaíso',
      role: 'Dirección',
      active: true
    })

    expect(useCollectiveDraftStore.getState().pendingAdds).toEqual([
      {
        artistId: 3,
        pseudonym: 'Cielo Sur',
        city: 'Concepción',
        role: 'Bajo',
        active: true
      }
    ])
    expect(useCollectiveDraftStore.getState().existingMembers).toEqual([
      ORIGINAL_MEMBERS[1],
      {
        artistId: 1,
        pseudonym: 'Luna Roja',
        city: 'Valparaíso',
        role: 'Dirección',
        active: true
      }
    ])
  })

  test('removes pending adds without touching originals and removes persisted members from existing members', () => {
    useCollectiveDraftStore.getState().init(ORIGINAL_MEMBERS, AVAILABLE_ARTISTS)
    useCollectiveDraftStore.getState().addMember({
      artistId: 3,
      pseudonym: 'Cielo Sur',
      city: 'Concepción',
      role: 'Bajo',
      active: true
    })

    useCollectiveDraftStore.getState().removeMember(3)
    useCollectiveDraftStore.getState().removeMember(2)

    expect(useCollectiveDraftStore.getState().pendingAdds).toEqual([])
    expect(useCollectiveDraftStore.getState().existingMembers).toEqual([
      ORIGINAL_MEMBERS[0]
    ])
    expect(useCollectiveDraftStore.getState().originalMembers).toEqual(
      ORIGINAL_MEMBERS
    )
  })

  test('updates members from existing and pending collections and manages nested dialog state', () => {
    useCollectiveDraftStore.getState().init(ORIGINAL_MEMBERS, AVAILABLE_ARTISTS)
    useCollectiveDraftStore.getState().openMemberCreate()
    useCollectiveDraftStore.getState().addMember({
      artistId: 3,
      pseudonym: 'Cielo Sur',
      city: 'Concepción',
      role: 'Bajo',
      active: true
    })
    useCollectiveDraftStore.getState().closeMemberCreate()
    useCollectiveDraftStore.getState().updateMember(3, { role: 'Teclado' })
    useCollectiveDraftStore.getState().openMemberUpdate(1)

    expect(useCollectiveDraftStore.getState()).toMatchObject({
      isMemberCreateOpen: false,
      memberBeingEdited: {
        artistId: 1,
        pseudonym: 'Luna Roja',
        city: 'Valparaíso',
        role: 'Voz',
        active: true
      }
    })
    expect(useCollectiveDraftStore.getState().pendingAdds).toEqual([
      {
        artistId: 3,
        pseudonym: 'Cielo Sur',
        city: 'Concepción',
        role: 'Teclado',
        active: true
      }
    ])

    useCollectiveDraftStore.getState().updateMember(1, { role: 'Dirección' })
    useCollectiveDraftStore.getState().closeMemberUpdate()

    expect(useCollectiveDraftStore.getState().existingMembers[0]).toEqual({
      artistId: 1,
      pseudonym: 'Luna Roja',
      city: 'Valparaíso',
      role: 'Dirección',
      active: true
    })
    expect(useCollectiveDraftStore.getState().memberBeingEdited).toBeNull()
  })
})