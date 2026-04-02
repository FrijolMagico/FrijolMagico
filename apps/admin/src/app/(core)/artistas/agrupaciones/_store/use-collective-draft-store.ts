import { create } from 'zustand'
import type { ArtistOption, MemberDraftItem } from '../_types/collective.types'

interface UpdateMemberPatch {
  role?: string | null
  active?: boolean
}

interface CollectiveDraftStore {
  originalMembers: MemberDraftItem[]
  existingMembers: MemberDraftItem[]
  pendingAdds: MemberDraftItem[]
  isMemberCreateOpen: boolean
  memberBeingEdited: MemberDraftItem | null
  availableArtists: ArtistOption[] | null
  init: (
    members: MemberDraftItem[],
    availableArtists: ArtistOption[] | null
  ) => void
  reset: () => void
  addMember: (member: MemberDraftItem) => void
  removeMember: (artistId: number) => void
  updateMember: (artistId: number, patch: UpdateMemberPatch) => void
  openMemberCreate: () => void
  closeMemberCreate: () => void
  openMemberUpdate: (artistId: number) => void
  closeMemberUpdate: () => void
}

function cloneMember(member: MemberDraftItem): MemberDraftItem {
  return { ...member }
}

function cloneMembers(members: MemberDraftItem[]) {
  return members.map(cloneMember)
}

function cloneArtists(availableArtists: ArtistOption[] | null) {
  return availableArtists?.map((artist) => ({ ...artist })) ?? null
}

function createInitialState() {
  return {
    originalMembers: [] as MemberDraftItem[],
    existingMembers: [] as MemberDraftItem[],
    pendingAdds: [] as MemberDraftItem[],
    isMemberCreateOpen: false,
    memberBeingEdited: null as MemberDraftItem | null,
    availableArtists: null as ArtistOption[] | null
  }
}

function findDraftMember(
  artistId: number,
  existingMembers: MemberDraftItem[],
  pendingAdds: MemberDraftItem[]
) {
  return (
    pendingAdds.find((member) => member.artistId === artistId) ??
    existingMembers.find((member) => member.artistId === artistId) ??
    null
  )
}

export const useCollectiveDraftStore = create<CollectiveDraftStore>((set) => ({
  ...createInitialState(),
  init: (members, availableArtists) =>
    set({
      originalMembers: cloneMembers(members),
      existingMembers: cloneMembers(members),
      pendingAdds: [],
      isMemberCreateOpen: false,
      memberBeingEdited: null,
      availableArtists: cloneArtists(availableArtists)
    }),
  reset: () => set(createInitialState()),
  addMember: (member) =>
    set((state) => {
      const nextMember = cloneMember(member)

      if (
        state.existingMembers.some(
          (existingMember) => existingMember.artistId === member.artistId
        ) ||
        state.pendingAdds.some(
          (pendingMember) => pendingMember.artistId === member.artistId
        )
      ) {
        return state
      }

      const wasOriginalMember = state.originalMembers.some(
        (originalMember) => originalMember.artistId === member.artistId
      )

      if (wasOriginalMember) {
        return {
          existingMembers: [...state.existingMembers, nextMember]
        }
      }

      return {
        pendingAdds: [...state.pendingAdds, nextMember]
      }
    }),
  removeMember: (artistId) =>
    set((state) => {
      const isPendingMember = state.pendingAdds.some(
        (member) => member.artistId === artistId
      )

      return {
        existingMembers: isPendingMember
          ? state.existingMembers
          : state.existingMembers.filter(
              (member) => member.artistId !== artistId
            ),
        pendingAdds: isPendingMember
          ? state.pendingAdds.filter((member) => member.artistId !== artistId)
          : state.pendingAdds,
        memberBeingEdited:
          state.memberBeingEdited?.artistId === artistId
            ? null
            : state.memberBeingEdited
      }
    }),
  updateMember: (artistId, patch) =>
    set((state) => {
      const applyPatch = (member: MemberDraftItem) => ({
        ...member,
        ...patch
      })

      return {
        existingMembers: state.existingMembers.map((member) =>
          member.artistId === artistId ? applyPatch(member) : member
        ),
        pendingAdds: state.pendingAdds.map((member) =>
          member.artistId === artistId ? applyPatch(member) : member
        ),
        memberBeingEdited:
          state.memberBeingEdited?.artistId === artistId
            ? applyPatch(state.memberBeingEdited)
            : state.memberBeingEdited
      }
    }),
  openMemberCreate: () =>
    set({
      isMemberCreateOpen: true,
      memberBeingEdited: null
    }),
  closeMemberCreate: () =>
    set({
      isMemberCreateOpen: false
    }),
  openMemberUpdate: (artistId) =>
    set((state) => ({
      isMemberCreateOpen: false,
      memberBeingEdited: findDraftMember(
        artistId,
        state.existingMembers,
        state.pendingAdds
      )
    })),
  closeMemberUpdate: () =>
    set({
      memberBeingEdited: null
    })
}))
